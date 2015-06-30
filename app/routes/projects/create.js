/**
 * tworzy projekt, jedynie profile admin może to zrobić
 * wysyłamy postem
 * profile_id
 * name
 * package
 * phone
 * firmname
 * firstname
 * lastname
 * email
 * phone
 * return
 * {
 * 	login - login(phone) leadera
 * 	id - id projektu
 * }
 */

var express = require('express');
var fs = require('fs');
var router = new express.Router();
var RuleAccess = require('ruleaccess');
var generatePassword = require('password-generator');

router.post("/", RuleAccess.isAllowed(), function(req, res){
	if(!req.validate(['phone', 'firmname', 'profile_id']))return;

	req.app.get("actions").projects.create({
		projectname : req.body.name,
		package : req.body.package,
		profileId : req.body.profile_id,
		firmname : req.body.firmname,
		firstname : req.body.firstname,
		lastname : req.body.lastname,
		email : req.body.email,
		phone : req.body.phone,
		password : generatePassword(12, true),
	})
	.then(function(data){
		try{
			fs.mkdirSync('./public/photos/'+data.projectModel.id);
		} catch(e){}
		try{
			fs.mkdirSync('./public/miniatures/'+data.projectModel.id);
		} catch(e){}
		try{
			fs.mkdirSync('./public/maps/'+data.projectModel.id);
		} catch(e){}
		if(data.accountOperation === 'CREATE_NEW' || data.accountOperation === 'ACTIVE_PROPOSITION'){
			console.log(data.accountOperation);
			req.app.get('sms').send(data.accountModel.phone, {
				firstname : data.accountModel.firstname,
				lastname : data.accountModel.lastname,
				accountId : data.accountModel.id,
				password : data.password,
				phone : data.accountModel.phone,
			}, function(err, message){
				if(err){
					//todo: zwrócić jakis błąd gdy sms nie wyjdzie
				}
				return res.sendData(200, {accountId : data.accountModel.id, login: data.accountModel.phone, projectId: data.projectModel.id});
			});
		} else {
			return res.sendData(200, {accountId : data.accountModel.id, login: data.accountModel.phone, projectId: data.projectModel.id});
		}
	})
	.catch(function(err){
		return res.sendValidationError(err);
	});

});

module.exports = router;