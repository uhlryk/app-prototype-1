var bcrypt = require('bcrypt');
/**
 * Tworzy profil firmy, może to utworzyć tylko admin
 */

module.exports = function(data, cb, models){
	models.sequelize.transaction().then(function (t) {
		return models.Profile.create({
			firmname : data.firmname,
			nip : data.nip,
			street_address : data.street_address,
			house_address : data.house_address,
			flat_address : data.flat_address,
			zipcode_address : data.zipcode_address,
			city_address : data.city_address,
		}, {transaction : t})
		.then(function(profileModel){
			t.commit();
			cb(null, {
				id : profileModel.id
			});
		})
		.catch(function (err) {
			cb(err);
			t.rollback();
		});
	});
};