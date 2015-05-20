
var bcrypt = require('bcrypt');
/**
 * zwraca obiekt token na podstawie numeru token
 */
module.exports = function(data, cb, models){
	data.profileAttributes = data.profileAttributes || [];
	data.accountAttributes = data.accountAttributes || [];
	return models.Profile.findAll({
		attributes: data.profileAttributes,
		where : {
			status : "ACTIVE"
		},
		include : [{
			model: models.Account,
			attributes: data.accountAttributes,
		}]
	},{ raw: true })
	.then(function(profileList){
		if(profileList === null){
			cb(null, null);
		}else {
			cb(null, profileList);
		}
	})
	.catch(function (err) {
		cb(err);
	});
};