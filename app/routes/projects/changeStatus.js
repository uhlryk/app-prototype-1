/**
 * super admin może zmieniać status projektu na ACTIVE lub DISABLE
 * wysyłamy postem
 * project_id id projektu
 * status status projektu [ACTIVE | DISABLE]
 */

var express = require('express');
var router = new express.Router();
var RuleAccess = require('ruleaccess');

router.post("/status", RuleAccess.isAllowed("PROJECT/CHANGE_STATUS"), function(req, res){
	req.checkBody('project_id', 'INVALID_FIELD').isId();
	req.sanitize('project_id').toInt();
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