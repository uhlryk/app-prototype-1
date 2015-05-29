/**
 * super admin może zmieniać status projektu na ACTIVE lub DISABLE
 * wysyłamy postem
 * project_id id projektu
 * status status projektu [ACTIVE | DISABLE]
 */

var express = require('express');
var router = new express.Router();
var generatePassword = require('password-generator');
var phone = require('phone');

router.post("/status", function(req, res){
	if(req.user === null)return res.sendData(401, {message : "NO_TOKEN"});
	if(req.user.type !== "SUPER")return res.sendData(403, {message : "NO_AUTHORIZATION"});
	req.checkBody('project_id', 'INVALID_FIELD').isId();
	req.checkBody('status', 'REQUIRE_FIELD').notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		return res.sendValidationError({name : "ExpressValidationError", errors :errors});
	}
	req.app.get("actions").projects.changeStatus({
		projectId : req.body.project_id,
		status : req.body.status,
	})
	.then(function(projectId){
		return res.sendData(200, {id: projectId});
	})
	.catch(function(err){
		return res.sendValidationError(err);
	});
});

module.exports = router;