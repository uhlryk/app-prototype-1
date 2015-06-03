/*jslint node: true */
"use strict";
/**
 *	obsługuje wszystkie odwołania /users/investor/
 */

var express = require('express');
var router = new express.Router();
var RuleAccess = require('ruleaccess');
var generatePassword = require('password-generator');
/**
 * Tworzy nową rolę i jeśli trzeba przy okazji konto
 */
router.post("/investor/create", RuleAccess.isAllowed(), function(req, res){
	return require("./helpers/userRoleRoute").create(req, res, "INVESTOR");
});
/**
 * Proponuje nową rolę i jeśli trzeba również propozycję konto (konto jest tak długo propozycją aż nie bedzie zaakceptowana jego rola w jakimkolwiek projekcie)
 */
router.post("/investor/proposition", RuleAccess.isAllowed(), function(req, res){
	return require("./helpers/userRoleRoute").proposition(req, res, "INVESTOR");
});
/**
 * Akceptowanie proponowanej roli
 */
router.post("/investor/accept", RuleAccess.isAllowed(), function(req, res){
	return require("./helpers/userRoleRoute").accept(req, res);
});
module.exports = router;