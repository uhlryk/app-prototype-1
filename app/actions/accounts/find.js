/**
 * zwraca account na podstawie numeru telefonu. Opcjonalnie możemy podać status. Domyślnie zwraca tylko dla ACTIVE
 * data.phone
 * data.status?
 */
module.exports = function(data, transaction, models, actions){
	return models.Account.find({
		where : {
			phone : data.phone,
			status : data.status?data.status:"ACTIVE"
		}
	}, {transaction : transaction})
	.then(function(accountModel){
		return new Promise(function(resolve) {
			resolve(accountModel);
		});
	});
};