/*jslint node: true */
"use strict";
/**
 *	obsługuje wszystkie odwołania /messages/
 *	zasób powiązany z komunikatami
 */

var express = require('express');
var router = new express.Router();

router.use("/messages/", require("./messages/private"));
router.use("/messages/", require("./messages/public"));

module.exports = router;