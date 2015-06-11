/**
 * Tworzy mapę do projektu w bazie
 * data.name
 * data.accountId
 * data.projectId
 * return
 * {mapModel}
 */

module.exports = function(data, transaction, models, actions){
	var mapModel;
	return models.MapImage.create({
			name : data.name,
			ProjectId : data.projectId,
			AccountId: data.accountId
	}, {transaction : transaction})
	.then(function(map){
		mapModel = map;
		return new Promise(function(resolve){
			resolve({
				mapModel: mapModel,
			});
		});
	});
};