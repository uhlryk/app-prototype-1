/**
 * Moduł tworzy publiczną grupę i wiadomość między autorem a wieloma użytkownikami,
 * W tym wypadku grup może być wiele takich samych więc nie sprawdzamy czy grupa istnieje
 * sprawdzamy uprawnienia do utworzenia grupy z danymi użytkownikami
 * Na końcu dodaje wiadomość, i jeśli ma photo to dodaje powiązania
 * Później do dodawania wiadomości w isniejącej grupie używana jest inna metoda
 * data.ownerId
 * data.recipientListId,
 * data.projectId
 * data.content
 * data.title
 * data.photoListId
 */

module.exports = function(data, transaction, models, actions){
	var messageGroupModel;
	return actions.messageGroups.checkAddRecipientPermission({
		projectId:data.projectId,
		ownerId:data.ownerId,
		recipientListId:data.recipientListId
	}, transaction)
	.then(function(){
		return actions.messageGroups.createGroup({
			type: 'GROUP',
			title : data.title,
			projectId:data.projectId
		}, transaction)
		;
	})
	.then(function(messageGroup){
		messageGroupModel = messageGroup;
		var accountListId = data.recipientListId.slice();
		accountListId.push(data.ownerId);
		return actions.messageGroups.addPublicGroupPermission({
			accountListId:accountListId,
			messageGroupId: messageGroupModel.id,
			projectId:data.projectId
		}, transaction);
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
			recipientListId: data.recipientListId,
		}, transaction);
	})
	.then(function(){
		return new Promise(function(resolve){
			resolve({
				model: messageGroupModel,
			});
		});
	});
};