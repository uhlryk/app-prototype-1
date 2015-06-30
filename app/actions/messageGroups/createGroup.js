/**
 * Moduł tworzy nową grupę do wiadomości, grupa może być prywatna lub nie.
 * argumenty:
 * data.type ['PRIVATE', 'GROUP']
 * data.title
 * data.private_id
 * data.projectId
 */

module.exports = function(data, transaction, models, actions){
	var modelData = {
		type : data.type,
		title : data.title,
		private_id : data.private_id,
		ProjectId:data.projectId,
	};
	return models.MessageGroup.create(
		modelData,
		{transaction : transaction}
	);
};