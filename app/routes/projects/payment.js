/**
 *
 */

var express = require('express');
var router = new express.Router();

router.post("/paymant", function(req, res){
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