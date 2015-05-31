/*jslint node: true */
"use strict";
var RuleAccess = require("ruleaccess");

function superAdminAllowedRule(userResource, params, options, resource){
	if(userResource && userResource.type === 'SUPER') return true;
	return false;
}
function superAdminDisallowedRule(userResource, params, options, resource){
	if(userResource && userResource.type === 'SUPER') return false;
	return true;
}

module.exports = function(req, res, next) {
	var ruleAccess = new RuleAccess();

	req.ruleAccess = ruleAccess;
	// req.addRuleResource = ruleAccess.addRuleResource;
	// req.setUserResource = ruleAccess.setUserResource;
	// req.getUserResource = ruleAccess.getUserResource;

	ruleAccess.addRuleResource("CREATE_PROFILE", superAdminAllowedRule);
	// console.log("AAA");
	// console.log(req.isAllowed);
	next();
};