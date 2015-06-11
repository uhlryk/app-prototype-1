/*jslint node: true */
"use strict";
/**
 *	obsługuje pdfy map które są zamieniane na grafiki
 */

var express = require('express');
var fs = require('fs');
var router = new express.Router();
var multer  = require('multer');
var RuleAccess = require('ruleaccess');
var PDFImage = require("pdf-image").PDFImage;

router.post("/maps/",  multer({
	dest: './tmp/',
	limits: {
		fileSize:1024*1024*5,//12MB
		files:1,
	},
	onFileUploadStart: function (file, req, res) {
		//sprawdzamy uprawnienia
		if(req.isAllowed(null, req) === false) {
			req.validateRuleAccess = false;
			return false;
		} else{
			req.validateRuleAccess = true;
		}
		//sprawdzamy mime-type
		if(file.mimetype !== "application/pdf" && file.mimetype !== "application/pdf"){
			return false;
		}
	},
	onFileUploadComplete: function (file, req, res) {
		if(file.fieldname !== "document" || file.truncated === true){
			fs.unlink('./' + file.path);
		}
	}}),
function(req, res, next){
	if(req.validateRuleAccess !== true){
		return res.status(401).send({message:'NOT_AUTHORIZED'});
	}
	if(!req.files.document){//brak właściwego pliku
		return res.sendValidationError({name : "AwValidationError", errors :[{type:"REQUIRE_FIELD",field:"document"}]});
	}
	if(req.files.document.truncated === true){//plik był za duży
		return res.sendValidationError({name : "AwValidationError", errors :[{type:"SIZE_LARGE",field:"document"}]});

	}
	if(!req.validate(['project_id'])){
		fs.unlink('./' + req.files.document.path);
		return;
	}
	var pdfImage = new PDFImage(req.files.document.path);
	pdfImage.convertPage(0).then(function (imagePath) {
		req.app.get("actions").maps.create({
			name:req.files.document.name,
			accountId:req.user.AccountId,
			projectId:req.body.project_id,
		})
		.then(function(data){
			return res.sendData(200,{mapId:data.mapModel.id, normal:req.files.document.path});
		})
		.catch(function(err){
			console.log(err);
			fs.unlink('./' + req.files.document.path);
			return res.sendValidationError(err);
		});
	}, function (err) {
		console.log(err);
		res.status(500).send(err);
	});
});
module.exports = router;
