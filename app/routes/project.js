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
	req.app.get("actions").profiles.findShort(profileId,
	function(err, profileModel){
		if(err !== null){
			return res.sendValidationError(err);
		}
		if(profileModel.Accounts.indexOf(req.user.AccountId) === -1){//znaczy że dany admin nie administruje profilem dla którego chce zrobić nowego admina
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
		}, function(err, data){
			if(err !== null){
				return res.sendValidationError(err);
			}
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
		});
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
	req.app.get("actions").projects.findLeader(projectId,
	function(err, projectData){
		if(err !== null){
			return res.sendValidationError(err);
		}
		if(projectData === null){
			return res.sendValidationError({name : "AwProccessError", type : "WRONG_VALUE"});
		}
		if(projectData['ProjectAccounts.Account.id'] !== req.user.AccountId){
			return res.sendValidationError({name : "AwProccessError", type : "WRONG_VALUE"});
		}
		req.app.get("actions").projects.configure({
			ProjectId : req.body.project_id,
			start_date : req.body.start_date,
			finish_date : req.body.finish_date,
			investor_firmname : req.body.investor_firmname,
		}, function(err, ProjectId){
			if(err !== null){
				return res.sendValidationError(err);
			}
			return res.sendData(200, {id: ProjectId});
		});
	});
});
router.post("/projects/paymant", function(req, res){
	if(req.user === null)return res.sendData(401, {message : "NO_TOKEN"});
	if(req.user.type !== "SUPER")return res.sendData(403, {message : "NO_AUTHORIZATION"});
	req.checkBody('project_id', 'INVALID_FIELD').isId();
	req.checkBody('paid_date', 'INVALID_FIELD').isDate();
	req.sanitize('paid_date').toDate();
	var projectId = req.body.project_id;
	var errors = req.validationErrors();
	if (errors) {
		return res.sendValidationError({name : "ExpressValidationError", errors :errors});
	}
	req.app.get("actions").projects.setPaidDate({
		ProjectId : projectId,
		paid_date : req.body.start_date,
	}, function(err, ProjectId){
		if(err !== null){
			return res.sendValidationError(err);
		}
		return res.sendData(200, {id: ProjectId});
	});
});
/**
 * super admin może zmieniać status projektu na ACTIVE lub DISABLE
 * wysyłamy postem
 * project_id id projektu
 * status status projektu [ACTIVE | DISABLE]
 */
router.post("/projects/status", function(req, res){
	if(req.user === null)return res.sendData(401, {message : "NO_TOKEN"});
	if(req.user.type !== "SUPER")return res.sendData(403, {message : "NO_AUTHORIZATION"});
	req.checkBody('project_id', 'INVALID_FIELD').isId();
	req.checkBody('status', 'REQUIRE_FIELD').notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		return res.sendValidationError({name : "ExpressValidationError", errors :errors});
	}
	req.app.get("actions").projects.changeStatus({
		ProjectId : req.body.project_id,
		status : req.body.status,
	}, function(err, ProjectId){
		if(err !== null){
			return res.sendValidationError(err);
		}
		return res.sendData(200, {id: ProjectId});
	});
});
/**
 * Lider projektu zmienia tryb projektu z budowa na serwis
 * Wskazujemy też nowego lidera lub informujemy że obecny jest liderem
 * wysyłamy postem
 * project_id
 * warranty liczba określająca liczbę miesięcy jakie trwa gwarancja
 * is_new_leader jeśli true to musimy podać przynajmniej telefon nowego lidera
 *
 */
router.post("/projects/mode/service", function(req, res){
	//TODO: moduł service
	if(req.user === null)return res.sendData(401, {message : "NO_TOKEN"});
	if(req.user.type === "SUPER")return res.sendData(403, {message : "NO_AUTHORIZATION"});
	req.checkBody('project_id', 'INVALID_FIELD').isId();
	var projectId = req.body.project_id;
	req.checkBody('warranty', 'REQUIRE_FIELD').isInt();
	req.sanitize("is_new_leader").toBoolean();
	var isNewLeader = req.body.is_new_leader;
	if(isNewLeader){
		req.sanitize("phone").normalizePhone();
		req.checkBody('phone', 'REQUIRE_FIELD').notEmpty();
	}
	var errors = req.validationErrors();
	if (errors) {
		return res.sendValidationError({name : "ExpressValidationError", errors :errors});
	}
	req.app.get("actions").projectAccounts.createRole({
		phone : req.body.phone,
		firstname : req.body.firstname,
		lastname : req.body.lastname,
		email : req.body.email,
		password : generatePassword(12, true),
		projectId : projectId,
		role : 'PROJECT_LEADER',
		status: 'ACTIVE',
	})
	.then(function(data){
		return res.sendData(200, data);
	})
	.catch(function (err) {
		console.log(err);
		return res.sendValidationError(err);
	});
	// req.app.get("actions").projects.setServiceMode({
	// 	ProjectId : projectId,
	// 	warranty : req.body.warranty,
	// 	isNewLeader : isNewLeader,
	// 	//tu dane dla lidera
	// 	firstname : req.body.firstname,
	// 	lastname : req.body.lastname,
	// 	email : req.body.email,
	// 	phone : req.body.phone,
	// 	password : generatePassword(12, true),
	// }, function(err, ProjectId){
	// 	if(err !== null){
	// 		return res.sendValidationError(err);
	// 	}
	// 	return res.sendData(200, {id: ProjectId});
	// });

});
module.exports = router;