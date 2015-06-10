/*jslint node: true */
"use strict";
/**
 *	obsługuje zdjęcia projektów
 */

var express = require('express');
var fs = require('fs');
var router = new express.Router();
var multer  = require('multer');
var RuleAccess = require('ruleaccess');

router.post("/photos/",  multer({
	dest: './public/photos/',
	limits: {
		fileSize:1024*1024*12,//12MB
		files:1,
	},
	changeDest: function(dest, req, res) {
		req.sanitize('project_id').toInt();
		return dest + '/' + req.body.project_id;
	},
	onFileUploadStart: function (file, req, res) {
		if(req.isAllowed(null, req) === false) {
			req.validateRuleAccess = false;
			return false;
		} else{
			req.validateRuleAccess = true;
		}
	},
	onFileUploadComplete: function (file, req, res) {
		if(file.fieldname !== "photo" || file.truncated === true){
			fs.unlink('./' + file.path);
		}
	}}),
function(req, res, next){
	if(req.validateRuleAccess !== true){
		return res.status(401).send({message:'NOT_AUTHORIZED'});
	}
	if(!req.files.photo){//brak właściwego pliku
		return res.sendValidationError({name : "AwValidationError", errors :[{type:"REQUIRE_FIELD",field:"photo"}]});
	}
	if(req.files.photo.truncated === true){//plik był za duży
		return res.sendValidationError({name : "AwValidationError", errors :[{type:"SIZE_LARGE",field:"photo"}]});

	}
	if(!req.validate(['category', 'project_id'])){
		fs.unlink('./' + req.files.photo.path);
		return;
	}
	// console.log(req.files);
	req.app.get("actions").photos.create({
		name:req.files.photo.name,
		mimetype:req.files.photo.mimetype,
		size:req.files.photo.size,
		accountId:req.user.AccountId,
		projectId:req.body.project_id,
		categoryType:req.body.category
	})
	.then(function(data){
		return res.sendData(200,{photoId:data.photoModel.id});
	})
	.catch(function(err){
		fs.unlink('./' + req.files.photo.path);
		return res.sendValidationError(err);
	});
});
module.exports = router;
