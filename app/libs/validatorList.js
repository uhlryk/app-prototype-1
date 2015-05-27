/**
 * lista customowych walidatorów do 'express-validator'
 */
module.exports.validators = {
	isId : function(value){
		var id = Number(value);
		return Number.isNaN(id) === false && id > 0 ;
	},
	isDateGreaterThen :function(value, compare){
		return value > compare;
	}
};
var phone = require('phone');
module.exports.sanitizers = {
	normalizePhone : function(value){
		return phone(value)[0];
	}
};