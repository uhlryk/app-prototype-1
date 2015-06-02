/**
 *	superadmin może określić że dany projekt jest opłacony do danej daty
 */

var express = require('express');
var RuleAccess = require('ruleaccess');
var router = new express.Router();

router.post("/paymant", RuleAccess.isAllowed(), function(req, res){
	req.checkBody('project_id', 'INVALID_FIELD').isId();
	req.sanitize('project_id').toInt();
	req.checkBody('paid_date', 'INVALID_FIELD').isDate();
	req.sanitize('paid_date').toDate();
	var projectId = req.body.project_id;
	var errors = req.validationErrors();
	if (errors) {
		return res.sendValidationError({name : "ExpressValidationError", errors :errors});
	}
	req.app.get("actions").projects.setPaidDate({
		projectId : projectId,
		paid_date : req.body.start_date,
	})
	.then(function(ProjectId){
		return res.sendData(200, {id: ProjectId});
	})
	.catch(function(err){
		return res.sendValidationError(err);
	});
});

module.exports = router;