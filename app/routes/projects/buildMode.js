/**
 * lider na starcie projektu musi go skonfigurować, żaden inny user
 * wysyłamy postem
 * project_id
 * start_date data rozpoczęcia projektu
 * finish_date data zakończenia trybu budowa
 * investor_firmname nazwa firmy inwestora
 *
 */

var express = require('express');
var router = new express.Router();
var RuleAccess = require('ruleaccess');

router.post("/mode/build", RuleAccess.isAllowed("PROJECT/SET_MODE_BUILD"), function(req, res){
	req.checkBody('project_id', 'INVALID_FIELD').isId();
	req.sanitize('project_id').toInt();
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
	req.app.get("actions").projects.setBuildMode({
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
});

module.exports = router;