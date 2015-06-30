/**
 * Moduł tworzy nową wiadomość
 * argumenty:
 * data.content
 * data.accountId
 * data.messageGroupId
 */

module.exports = function(data, transaction, models, actions){

	return models.Message.create({
		content:data.content,
		MessageGroupId: data.messageGroupId,
		AccountId: data.accountId
	},{transaction : transaction});
};