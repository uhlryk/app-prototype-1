/*jslint node: true */
"use strict";
/**
 *	obsługuje wszystkie odwołania /users/designer/
 */

var express = require('express');
var router = new express.Router();
var RuleAccess = require('ruleaccess');
var generatePassword = require('password-generator');
/**
 * Tworzy nową rolę i jeśli trzeba przy okazji konto
 */
router.post("/designer/create/", RuleAccess.isAllowed(), function(req, res){
	return require("./helpers/userRoleRoute").create(req, res, "DESIGNER");
});
/**
 * Proponuje nową rolę i jeśli trzeba również propozycję konto (konto jest tak długo propozycją aż nie bedzie zaakceptowana jego rola w jakimkolwiek projekcie)
 */
router.post("/designer/proposition/", RuleAccess.isAllowed(), function(req, res){
	return require("./helpers/userRoleRoute").proposition(req, res, "DESIGNER");
});
/**
 * Akceptowanie proponowanej roli
 */
router.post("/designer/accept/", RuleAccess.isAllowed(), function(req, res){
	return require("./helpers/userRoleRoute").accept(req, res, "DESIGNER");
});
module.exports = router;