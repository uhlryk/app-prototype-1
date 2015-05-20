/*jslint node: true */
"use strict";
/**
 *	obsługuje wszystkie odwołania /users/
 *	tworzy użytkownika projektu, czyli przede wszystkim ProjectAccount i Account
 */

var express = require('express');
var router = new express.Router();


router.use("/users/", require("./users/profileAdmin.js"));
router.use("/users/", require("./users/coworker.js"));
router.use("/users/", require("./users/investor.js"));
router.use("/users/", require("./users/inspector.js"));
router.use("/users/", require("./users/designer.js"));
router.use("/users/", require("./users/subcontractor.js"));

// router.post("/users/", function(req, res, next){
// 	//strefa dla zalogowanych
// 	if(req.user === null)return res.sendData(401, {message : "NO_TOKEN"});

// 	/**
// 	 * najpierw określamy jaki jest cel stworzenia użytkownika, jakiego typu, jaki projekt, jaka firma i czy to tylko zgłoszenie
// 	 */
// 	var newTypeUser = req.body.type_user;//jaki typ usera : profile_admin, coworker, investor, designer, subcontractor
// 	var requestType = req.body.type_request;//jaki typ zgłoszenia : add or proposal
// 	var profileId = req.body.profile_id;//do jakiego profilu firmy jest ten user - zastosowanie tylko dla profile_admin
// 	var projectId = req.body.project_id;//do jakiego projektu, zastosowanie dla wszystkich innych userów

// 	var userType = req.user.type;
// 	//superadmin może dodać tylko profile_admina resztę ma zablokowaną
// 	if(userType === "SUPER" && newTypeUser !== 'profile_admin'){
// 		return res.sendData(403, {message : "NO_AUTHORIZATION"});
// 	}

// 	switch(newTypeUser){
// 		case 'profile_admin':
// 			//sprawdzenie czy jeśli to zwykły
// 		break;
// 		case 'coworker':

// 		break;
// 		case 'investor':

// 		break;
// 		case 'designer':

// 		break;
// 		case 'subcontractor':

// 		break;
// 		default:
// 			return res.sendData(400, {message : "WRONG_USER_TYPE"});
// 	}

// });

module.exports = router;
