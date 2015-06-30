/*jslint node: true */
"use strict";
/**
 * Obsługuje komunikaty publiczne, czyli grupy, zawierające więcej niż dwie osoby. Wątek z takimi samymi osobami może być ząłożony
 * wielokrotnie.
 * DO wątku można dodawać nowe osoby.
 * Wątek widziany jest przez cały zakres ról danych userów (czyli jak w wątku jest inwestor to wszyscy inwestorzy to widzą)
 * Mogą pisać również inni z grup
 * Tworząc wątek wysyłamy pierwszą wiadomość
 * req.body.account_list lista id userów z którymi chcemy utworzyć grupę
 * req.body.project_id id projektu w ktorym chcemy korespondować
 * req.body.content? wiadomość
 * req.body.title tytuł grupy
 * req.body.photo? lista id zdjęć; w przyszłości będzie jeszcze : video,sound;
 */


var express = require('express');
var router = new express.Router();
var RuleAccess = require('ruleaccess');

/**
 * Odpowiada za tworzenie wątku w dyskusji
 */
router.post("/public", RuleAccess.isAllowed(), function(req, res, next){
	req.sanitize('content').escape();
	req.sanitize('title').escape();
	var photoList = [];
	if(req.body.photo && req.body.photo.length && req.body.photo.length>0){
		if(req.body.photo.length>10){
			return res.sendValidationError({name : "AwValidationError", errors :[{type:"PHOTO_SIZE",field:"photo"}]});
		}
		for(var i=0; i< req.body.photo.length; i++){
			var id = req.body.photo[i];
			if (id === parseInt(id, 10)){
				photoList.push(id);
			} else{
				return res.sendValidationError({name : "AwValidationError", errors :[{type:"PHOTO_ID",field:"photo"}]});
			}
		}
	}
	if(!req.body.account_list || !req.body.account_list.length || req.body.account_list.length < 1){
		return res.sendValidationError({name : "AwValidationError", errors :[{type:"NO_RECIPIENT",field:"account_list"}]});
	}
	if(req.body.account_list.length>10){
		return res.sendValidationError({name : "AwValidationError", errors :[{type:"ACCOUNT_SIZE",field:"account_list"}]});
	}
	req.app.get("actions").messages.createPublic({
		projectId:req.body.project_id,
		ownerId:req.user.AccountId,
		recipientListId:req.body.account_list,
		content:req.body.content,
		title: req.body.title,
		photoListId: photoList
	})
	.then(function(data){
		return res.sendData(200,{groupId : data.model.id});
	})
	.catch(function(err){
		return res.sendValidationError(err);
	});
});
module.exports = router;