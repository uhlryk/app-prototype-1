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

router.post("/mode/build/", RuleAccess.isAllowed(), function(req, res){
	if(!req.validate(['project_id', 'start_date', 'finish_date', 'investor_firmname']))return;

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