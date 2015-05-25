/**
 * zwraca account na podstawie numeru telefonu
 */
module.exports = function(data, cb, models){
	return models.Account.find({
		where : {
			phone : data.phone,
			status : "ACTIVE"
		}
	}, {raw:true})
	.then(function(accountModel){
		if(accountModel === null){
			cb(null, null);
		}else {
			cb(null, accountModel);
		}
	});
};