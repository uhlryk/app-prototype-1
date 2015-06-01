//remove

/**
 * TODO: całe do przebudowy lub usunięcia. najlepiej by zastąpił to bardziej użyteczny moduł
 * Służy do wyciąfnięcia dla projektu id kont które są PROFILE_ADMIN
 * data.profileId id profilu dla którego ma zwrócić PROFILE_ADMIN
 * return
 * {
 * 	id : 1 //id danego profilu
 * 	Accounts : [1,2,3]//listę id Account które są administratorami
 * }
 */
module.exports = function(data, transaction, models, actions){
	var profileModel;
		return models.Profile.findOne({
			attributes: ['id'],
			where : {
				id : data.profileId
			},
		}, {raw : true, transaction : transaction})
		.then(function(model){
			if(model === null){
				throw {name : "AwProccessError", type:"EMPTY_PROFILE"};
			}
			profileModel = model;
			return models.Account.findAll({
				attributes: ['id'],
				where: {
					ProfileId: model.id
				}
			}, {raw : true, transaction : transaction});
		})
		.then(function(modelList){
			profileModel.Accounts = [];
			modelList.forEach(function(idObj){
				profileModel.Accounts.push(idObj.id);
			});
			return new Promise(function(resolve) {
				resolve(profileModel);
			});
		});
};