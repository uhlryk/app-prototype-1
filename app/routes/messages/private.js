/*jslint node: true */
"use strict";
/**
 *	obsługuje komunikaty prywatne czyli jeden user do drugiego, nie można dodać do wątku kolejnych osób
 *	w ramach projektu jest w zasadzie jeden wątek cały czas
 *	req.body.account_id id konta z którym chcemy korespondować
 *	req.body.project_id id projektu w ktorym chcemy korespondować
 *	req.body.content? wiadomość
 *	req.body.photo? lista id zdjęć; w przyszłości będzie jeszcze : video,sound;
 *
 */

var express = require('express');
var router = new express.Router();
var RuleAccess = require('ruleaccess');

/**
 * Walidacja sprawdza tylko czy dany z userów jest w projekcie, nie sprawdza dodatkowych uprawnień.
 * Te muszą być sprawdzone tu.
 * Czyli musimy sprawdzić czy:
 * 1) w ramach danego projektu jest już korespondencja między tymi userami
 * 2) jeśli nie, to czy obaj userzy są w tym projekcje i czy są uprawnienia do ich korespondencji
 */
router.post("/private", RuleAccess.isAllowed(), function(req, res, next){
	if(!req.validate(['account_id']))return;
	req.sanitize('content').escape();
	var photoList = [];
	if(req.body.photo && req.body.photo.length && req.body.photo.length>0){
		for(var i=0; i< req.body.photo.length; i++){
			var id = req.body.photo[i];
			if (id === parseInt(id, 10)){
				photoList.push(id);
			} else{
				return res.sendValidationError({name : "AwValidationError", errors :[{type:"PHOTO_ID",field:"photo"}]});
			}
		}
	}
	req.app.get("actions").messages.createPrivate({
		projectId:req.body.project_id,
		ownerId:req.user.AccountId,
		recipientId:req.body.account_id,
		content:req.body.content,
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