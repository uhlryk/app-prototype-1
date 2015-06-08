/**
 * Lider projektu zmienia tryb projektu z budowa na serwis
 * Wskazujemy też nowego lidera lub informujemy że obecny jest liderem
 * wysyłamy postem
 * project_id
 * warranty_date liczba określająca liczbę miesięcy jakie trwa gwarancja
 * is_new_leader jeśli true to musimy podać przynajmniej telefon nowego lidera
 * return
 * {accountId, login, projectId}
 */

var express = require('express');
var router = new express.Router();
var RuleAccess = require('ruleaccess');
var generatePassword = require('password-generator');
var phone = require('phone');

router.post("/mode/service/", RuleAccess.isAllowed(), function(req, res){
	req.sanitize("is_new_leader").toBoolean();
	if(req.body.is_new_leader){
		if(!req.validate(['project_id', 'firmname', 'warranty_date', 'phone']))return;
	} else {
		if(!req.validate(['project_id', 'firmname', 'warranty_date']))return;
	}

	req.app.get("actions").projects.setServiceMode({
		projectId : req.body.project_id,
		warranty_date : req.body.warranty_date,
		isNewLeader : req.body.is_new_leader,
		//tu dane dla lidera
		firmname : req.body.firmname,
		firstname : req.body.firstname,
		lastname : req.body.lastname,
		email : req.body.email,
		phone : req.body.phone,
		password : generatePassword(12, true),
	})
	.then(function(data){
		if(data.accountOperation === 'CREATE_NEW' || data.accountOperation === 'ACTIVE_PROPOSITION'){
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
			//ponieważ konto było aktywne nie znamy jego hasła.
			return res.sendData(200, {accountId : data.accountModel.id, login: data.accountModel.phone, projectId: data.projectModel.id});
		}
	})
	.catch(function (err) {
		return res.sendValidationError(err);
	});
});

module.exports = router;