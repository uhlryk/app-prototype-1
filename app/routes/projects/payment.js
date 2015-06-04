/**
 *	superadmin może określić że dany projekt jest opłacony do danej daty
 */

var express = require('express');
var RuleAccess = require('ruleaccess');
var router = new express.Router();

router.post("/paymant/", RuleAccess.isAllowed(), function(req, res){
	if(!req.validate(['project_id', 'paid_date']))return;

	req.app.get("actions").projects.setPaidDate({
		projectId : req.body.project_id,
		paid_date : req.body.paid_date,
	})
	.then(function(ProjectId){
		return res.sendData(200, {id: ProjectId});
	})
	.catch(function(err){
		return res.sendValidationError(err);
	});
});

module.exports = router;