
var bcrypt = require('bcrypt');
/**
 * zwraca obiekt token na podstawie numeru token
 */
module.exports = function(data, cb, models){
	return models.Token.find({
		where : {
			token : data.token,
			status : "ACTIVE"
		},
		include : [models.Account]
	})
	.then(function(tokenModel){
		if(tokenModel === null){
			cb(null, null);
		}else {
			cb(null, {
				id : tokenModel.id,
				token : tokenModel.token,
				data : tokenModel.data,
				type : tokenModel.type,
				AccountId : tokenModel.AccountId,
			});
		}
	});
};