/**
 * zwraca dane powiązane z tokenem, token użytkownik wysyła do api i wtedy sprawdzamy w tym modelu i dostajemy
 * informacje o użytkowniku
 * data.token
 * return
 * {
 *		data zserializowane dodatkowe dane
 *		type zależy cz mamy do czynienia z użytkownikiem czy superadministratorem 'SUPER','USER'
 *		accountId id użytkownika który używa tokena
 *	}
 *	lub undefined
 */
module.exports = function(data, transaction, models, actions){
	return models.Token.find({
		where : {
			token : data.token,
			status : "ACTIVE"
		},
		include : [models.Account]
	}, {transaction : transaction})
	.then(function(tokenModel){
		var dataModel = null;
		if(tokenModel !== null){
			dataModel = {
				data : tokenModel.data,
				type : tokenModel.type,
				accountId : tokenModel.AccountId,
			};
		}
		return new Promise(function(resolve) {
			resolve(dataModel);
		});
	});
};