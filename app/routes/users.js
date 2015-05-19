/*jslint node: true */
"use strict";
/**
 *	obsługuje wszystkie odwołania /users/
 *	tworzy użytkownika projektu, czyli przede wszystkim ProjectAccount i Account
 */

var express = require('express');
var router = new express.Router();
//lub router.get("/", function(req, res){...});
router.route("/")
.post(function(req, res){
	// var createAccount = require("./createAccount");
	// createAccount({
	// 	firstname : req.body.firstname,
	// 	lastname : req.body.lastname,
	// 	email : req.body.email,
	// 	phone : req.body.phone,
	// 	nip : req.body.nip,
	// 	street_address : req.body.street_address,
	// 	house_address : req.body.house_address,
	// 	flat_address : req.body.flat_address,
	// 	zipcode_address : req.body.zipcode_address,
	// 	city_address : req.body.city_address,
	// }, function(responseData){
	// 	res.sendData(responseData);
	// });

});
module.exports = router;
