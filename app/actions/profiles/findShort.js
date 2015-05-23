/**
 * zwraca obiekt o strukturze:
 * {
 * 	id : 1 //id danego profilu
 * 	Accounts : [1,2,3]//listę id Account które są administratorami
 * }
 */
module.exports = function(profileId, cb, models){
	var profileModel;
	models.sequelize.transaction().then(function (t) {
		return models.Profile.findOne({
			attributes: ['id'],
			where : {
				id : profileId
			},
		}, {raw : true, transaction : t})
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
			}, {raw : true, transaction : t});
		})
		.then(function(modelList){
			t.commit();
			profileModel.Accounts = [];
			modelList.forEach(function(idObj){
				profileModel.Accounts.push(idObj.id);
			});
			cb(null, profileModel);
		})
		.catch(function (err) {
			t.rollback();
			cb(err);
		});
	});
};