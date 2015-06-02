/*jslint node: true */
"use strict";
/**
 *	obsługuje wszystkie odwołania /users/
 *	tworzy administratora profilu
 */

var express = require('express');
var router = new express.Router();
var RuleAccess = require('ruleaccess');
/**
 * Tworzy nową rolę i jeśli trzeba przy okazji konto
 */
router.post("/coworker/create", RuleAccess.isAllowed(), function(req, res, next){
	req.checkBody('profile_id', 'INVALID_FIELD').isId();
	req.sanitize('profile_id').toInt();
	var profileId = req.body.profile_id;
	req.sanitize("phone").normalizePhone();
	req.checkBody('phone', 'REQUIRE_FIELD').notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		return res.sendValidationError({name : "ExpressValidationError", errors :errors});
	}
	return res.sendData(403, {message: "NOT_IMPLEMENTED"});
});
/**
 * Proponuje nową rolę i jeśli trzeba również propozycję konto (konto jest tak długo propozycją aż nie bedzie zaakceptowana jego rola w jakimkolwiek projekcie)
 */
router.post("/coworker/proposition", RuleAccess.isAllowed(), function(req, res, next){
	req.checkBody('profile_id', 'INVALID_FIELD').isId();
	req.sanitize('profile_id').toInt();
	var profileId = req.body.profile_id;
	req.sanitize("phone").normalizePhone();
	req.checkBody('phone', 'REQUIRE_FIELD').notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		return res.sendValidationError({name : "ExpressValidationError", errors :errors});
	}
	return res.sendData(403, {message: "NOT_IMPLEMENTED"});
});
/**
 * Akceptowanie proponowanej roli
 */
router.post("/coworker/accept/:id", RuleAccess.isAllowed(), function(req, res, next){
	console.log("A3");
	return res.sendData(403, {message: "NOT_IMPLEMENTED"});
});
module.exports = router;