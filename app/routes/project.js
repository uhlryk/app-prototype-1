/*jslint node: true */
"use strict";
/**
 *	obsługuje wszystkie odwołania /projects/
 *	zasób powiązany z projektami
 */

var express = require('express');
var router = new express.Router();

router.use("/projects/", require("./projects/create"));
router.use("/projects/", require("./projects/buildMode"));
router.use("/projects/", require("./projects/payment"));
router.use("/projects/", require("./projects/changeStatus"));
router.use("/projects/", require("./projects/serviceMode"));

module.exports = router;