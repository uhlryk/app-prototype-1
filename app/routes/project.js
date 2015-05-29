/*jslint node: true */
"use strict";
/**
 *	obsługuje wszystkie odwołania /projects/
 *	zasób powiązany z projektami
 */

var express = require('express');
var router = new express.Router();

var generatePassword = require('password-generator');

router.post("/projects", function(req, res){
	if(req.user === null)return res.sendData(401, {message : "NO_TOKEN"});
	if(req.user.type === "SUPER")return res.sendData(403, {message : "NO_AUTHORIZATION"});
	req.checkBody('profile_id', 'INVALID_FIELD').isId();
	req.sanitize('profile_id').toInt();
	req.sanitize("phone").normalizePhone();
	req.checkBody('phone', 'REQUIRE_FIELD').notEmpty();
	var profileId = req.body.profile_id;
	var login = req.body.phone;
	var errors = req.validationErrors();
	if (errors) {
		return res.sendValidationError({name : "ExpressValidationError", errors :errors});
	}
	req.app.get("actions").profiles.findShort({
		profileId : profileId,
	})
	.then(function(profileModel){
		if(profileModel.Accounts.indexOf(req.user.accountId) === -1){//znaczy że dany admin nie administruje profilem dla którego chce zrobić nowego admina
			return res.sendData(403, {message : "NO_AUTHORIZATION"});
		}
		//wiemy że mamy do czynienia z adminem danego profilu
		req.app.get("actions").projects.create({
			//dane dla projektu
			name : req.body.name,
			package : req.body.package,
			ProfileId : profileId,
			//tu dane dla lidera
			firstname : req.body.firstname,
			lastname : req.body.lastname,
			email : req.body.email,
			phone : login,
			password : generatePassword(12, true),
		})
		.then(function(data){
			if(data.sendSMS){
				req.app.get('sms').send(data.phone, {
					firstname : data.firstname,
					lastname : data.lastname,
					AccountId : data.id,
					password : data.password,
					phone : data.phone,
				}, function(err, message){
					if(err){
						//todo: zwrócić jakis błąd gdy sms nie wyjdzie
					}
					return res.sendData(200, {login: data.phone, id: data.ProjectId});
				});
			} else {
				return res.sendData(200, {login: data.phone, id: data.ProjectId});
			}
		})
		.catch(function(err){
			return res.sendValidationError(err);
		});
	})
	.catch(function (err) {
		return res.sendValidationError(err);
	});
});
/**
 * lider na starcie projektu musi go skonfigurować, żaden inny user
 * @param  {[type]} req      [description]
 * @param  {[type]} res){} [description]
 * @return {[type]}          [description]
 */
router.post("/projects/configure", function(req, res){
	if(req.user === null)return res.sendData(401, {message : "NO_TOKEN"});
	if(req.user.type === "SUPER")return res.sendData(403, {message : "NO_AUTHORIZATION"});
	req.checkBody('project_id', 'INVALID_FIELD').isId();
	req.checkBody('start_date', 'INVALID_FIELD').isDate();
	req.sanitize('start_date').toDate();
	req.checkBody('finish_date', 'INVALID_FIELD').isDate();
	req.sanitize('finish_date').toDate();
	req.checkBody('finish_date', 'REQUIRE_DATE_GREATER').isDateGreaterThen(req.body.start_date);
	req.sanitize('investor_firmname').escape();
	var projectId = req.body.project_id;
	var errors = req.validationErrors();
	if (errors) {
		return res.sendValidationError({name : "ExpressValidationError", errors :errors});
	}
	//<DOZMIANY>
	req.app.get("actions").projects.findLeader({
		projectId: projectId
	})
	.then(function(projectData){
		if(projectData === null){
			return res.sendValidationError({name : "AwProccessError", type : "WRONG_VALUE"});
		}
		if(projectData.projectAccounts === null){
			return res.sendValidationError({name : "AwProccessError", type : "WRONG_VALUE"});
		}
		var isUserProjectLeader = false;
		projectData.toJSON().ProjectAccounts.forEach(function(projectAccounts){
			if(projectAccounts.Account.id === req.user.accountId){
				isUserProjectLeader = true;
			}
		});
		if(isUserProjectLeader === false){
			return res.sendValidationError({name : "AwProccessError", type : "WRONG_VALUE B"});
		}
		// </DOZMIANY>
		req.app.get("actions").projects.configure({
			projectId : req.body.project_id,
			start_date : req.body.start_date,
			finish_date : req.body.finish_date,
			investor_firmname : req.body.investor_firmname,
		})
		.then(function(projectId){
			return res.sendData(200, {id: projectId});
		})
		.catch(function(err){
			return res.sendValidationError(err);
		});
	})
	.catch(function(err){
		return res.sendValidationError(err);
	});
});


router.use("/projects/", require("./projects/payment"));
router.use("/projects/", require("./projects/changeStatus"));
router.use("/projects/", require("./projects/serviceMode"));


module.exports = router;