/**
 * Moduł tworzy prywatną wiadomość między dwoma użytkownikami
 * Musi sprawdzić czy grupa jest, jeśli jest to nie sprawdza uprawnień, jeśli nie ma to sprawdza uprawnienia
 * a potem próbuje utworzyć grupę. Na końcu dodaje wiadomość, i jeśli ma photo to dodaje powiązania
 * data.ownerId
 * data.recipientId,
 * data.projectId
 * data.content
 * data.photoListId
 */

module.exports = function(data, transaction, models, actions){
	var lowerUser, upperUser;
	if(data.ownerId>data.recipientId){
		upperUser=data.ownerId;
		lowerUser=data.recipientId;
	}else{
		lowerUser=data.ownerId;
		upperUser=data.recipientId;
	}
	var private_id = data.projectId+"_"+lowerUser+"_"+upperUser;
	var messageGroupModel;
	return models.MessageGroup.find({
		where : {
			ProjectId : data.projectId,
			private_id : private_id
		}
	}, {transaction : transaction})
	.then(function(messageGroup){
		if(messageGroup){
		/**
		 * mamy grupę więc nie sprawdzamy uprawnień tylko dodajemy wiadomość
		 */
			messageGroupModel = messageGroup;
		} else {
		/**
		 * nie ma grupy więc sprawdzamy uprawnienia userów, potem tworzymy nową grupę i dopiero później dodajemy wiadomość
		 */

			return actions.messageGroups.checkAddRecipientPermission({
				projectId:data.projectId,
				ownerId:data.ownerId,
				recipientListId:[data.recipientId]
			}, transaction)
			.then(function(){
				/**
				 * nie obsługujemy błędu, który mógłby powstać jeśli grupa powstanie w międzyczasie przez inny proces.
				 * User dostanie błąd i może ponownie się odezwać, gdzie błędu nie będzie już.
				 * @type {String}
				 */
				return actions.messageGroups.createGroup({
					type: 'PRIVATE',
					private_id : private_id,
					projectId:data.projectId
				}, transaction)
				;
			})
			.then(function(messageGroup){
				messageGroupModel = messageGroup;
				return actions.messageGroups.createAccount({
					messageGroupId: messageGroupModel.id,
					accountId:data.ownerId
				}, transaction);
			})
			.then(function(){
				return actions.messageGroups.createAccount({
					messageGroupId: messageGroupModel.id,
					accountId:data.recipientId
				}, transaction);
			})
			;
		}
	})
	.then(function(){
		return actions.messages.create({
			content:data.content,
			messageGroupId:messageGroupModel.id,
			accountId:data.ownerId
		}, transaction);
	})
	.then(function(message){
		return actions.messages.addPhoto({
			ownerId:data.ownerId,
			projectId : data.projectId,
			photoListId: data.photoListId,
			recipientListId: [data.recipientId],
		}, transaction);
	})
	.then(function(){
		return new Promise(function(resolve){
			resolve({
				model: messageGroupModel,
			});
		});
	});
	;
};