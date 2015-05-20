
var bcrypt = require('bcrypt');
/**
 * zwraca obiekt token na podstawie numeru token
 */
module.exports = function(data, cb, models){
	return models.Account.find({
		where : {
			phone : data.phone,
			status : "ACTIVE"
		}
	}, {raw:true})
	.then(function(accountData){
		if(accountData === null){
			cb(null, null);
		}else {
			cb(null, accountData);
		}
	});
};