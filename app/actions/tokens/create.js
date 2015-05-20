var bcrypt = require('bcrypt');
/**
 * Tworzy powiązanie tokena z bazą danych. Jeśli dany user ma już aktywny token, to nowy go zastąpi blokując stary
 * @param  {
 *         token:string,
 *         AccountId?:int,
 *         type:'SUPER','USER'
 *         data:dodatkowe zserializowane dane
 *         }   data obiekt z danymi do wypełnienia
 * @param  {Function} cb     [description]
 * @param  {[type]}   models nie wywołujemy, jest to przez system nwykonywane
 * @return {[type]}          [description]
 */
module.exports = function(data, cb, models){
	var customerModel;
	models.sequelize.transaction().then(function (t) {
		return models.Token.update({
			status : 'DISABLE'
		},
		{//wyszukujemy wszystkie aktywne tokeny tego usera i je blokujemy
			where : {
				AccountId : data.AccountId,
				status : 'ACTIVE'
			}
		}, {transaction : t})
		.then(function(){
			return models.Token.create({
				token : data.token,
				type :  data.type,
				AccountId : data.AccountId,
				data : data.data,
			}, {transaction : t});
		})
		.then(function(tokenModel){
			t.commit();
			cb(null, {
				token : tokenModel.token
			});
		})
		.catch(function (err) {
			cb(err);
		});
	});

};