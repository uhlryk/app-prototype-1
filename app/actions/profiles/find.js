
var bcrypt = require('bcrypt');
/**
 * zwraca obiekt token na podstawie numeru token
 */
module.exports = function(data, cb, models){
	data.profileAttributes = data.profileAttributes || [];
	data.accountAttributes = data.accountAttributes || [];
	return models.Profile.findOne({
		attributes: data.profileAttributes,
		where : {
			id : data.profileId
		},
		include : [{
			model: models.Account,
			attributes: data.accountAttributes,
		}]
	})
	.then(function(profileModel){
		if(profileModel === null){
			cb(null, null);
		}else {
			cb(null, profileModel);
		}
	})
	.catch(function (err) {
		cb(err);
	});
};