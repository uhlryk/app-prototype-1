/**
 * Gdy dane konto się zaloguje to otrzymuje token. Ten model przechowuje aktualny token i przy
 * zapisie wcześniejsze tokeny deaktualizuje
 * data.accountId id konta
 * data.token
 * data.type zależy cz mamy do czynienia z użytkownikiem czy superadministratorem 'SUPER','USER'
 * data.data dodatkowe zserializowane dane
 * return
 * {model: Token}
 */
module.exports = function(data, transaction, models, actions){
	return models.Token.update({
		status : 'DISABLE'
	}, {//wyszukujemy wszystkie aktywne tokeny tego usera i je blokujemy
		where : {
			AccountId : data.accountId,
			status : 'ACTIVE'
		},
		transaction : transaction
	})
	.then(function(){
		return models.Token.create({
			token : data.token,
			type :  data.type,
			AccountId : data.accountId,
			data : data.data,
		}, {transaction : transaction});
	})
	.then(function(tokenModel){
		return new Promise(function(resolve) {
			resolve({model : tokenModel});
		});
	});
};