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

module.exports = router;
