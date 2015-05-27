/**
 * Moduł tworzy nowego usera, wpina się w transakcję
 * data.transaction dodajemy transakcję
 * data.phone niezbędne pole, do identyfikacji i do utworzenia konta
 * opcjonalne:
 * data.firstname
 * data.lastname
 * data.email
 * data.password
 */

var bcrypt = require('bcrypt');
module.exports = function(data, cb, models, actions){
	if(data.transaction){
		return model(data, t, models);
	} else {
		return models.sequelize.transaction()
		.then(function (t) {
			return model(data, t, models)
			.then(function(result){
				t.commit();
				return new Promise(function(resolve) {
					resolve(result);
				});
			})
			.catch(function (err) {
				t.rollback();
				throw err;
			});
		});
	}
};
function model(data, cb, models, actions){
	var transaction = data.transaction;
	/**
	 * określamy co zostało zrobione z kontem, CREATE_NEW, INACTIVE, ACTIVE, może się to przydać do kolejnych operacji
	 * np jeśli było INACTIVE i ACTIVE to należy sprawdzić czy już w danym projekcie nie pełni jakiś ról
	 */
	var operation;
	var accountModel;
	return models.Account.find({
		where : {
			phone : data.phone
		}
	}, {transaction : transaction})
	.then(function(account){
		throw {name : "AwProccessError", type:"OTHER_ERROR"};
		if(account === null){
			/**
			 * oznacza że nie ma dla danegu telefonu konta, musimy więc utworzyć nowe konto
			 */
			operation = 'CREATE_NEW';
			return models.Account.create({
				firstname : data.firstname,
				lastname : data.lastname,
				email : data.email,
				phone : data.phone,
				password : bcrypt.hashSync(data.password, 8)
			}, {transaction : transaction})
			.then(function(account){
				accountModel  = account;
			});
		} else if(account.status === 'DISABLE'){//konto istnieje ale jest zablokowane
			//todo:testy gdy lider istnieje ale jest zablokowany
			throw {name : "AwProccessError", type:"DISABLE_USER"};
				/**
				 * znaczy że konto już istnieje. Musimy więc sprawdzić czy w danym projekcie konto
				 * ma już jakieś role PROJECT_ACCOUNT dla tego projektu (rola ProfileAdmin się tu nie pojawi).
				 * jeśli ma role INACTIVE to je ustawiamy na DELETE
				 * jeśli ma role inne niż COWORKER to trow error
				 * Jeśli był to COWORKER to zamieniamy na PROJECT_LEADER
				 * PROJECT_ACCOUNT może być równocześnie PROJECT_LEADER
				 * UWAGA:
				 * Należy pamiętać by w projekcie był zawsze leader. I by był jeden leader.
				 * Proces musi iść w transakcji z równoczesnym usunięciem leadera z projektu
				 */
		} else if(account.status === 'INACTIVE'){
			accountModel = account;
			operation = 'INACTIVE';
		} else if(account.status === 'ACTIVE'){
			accountModel = account;
			operation = 'ACTIVE';
		} else {
			/**
			 * Fallback gdyby pojawił się jakiś inny status
			 */
			throw {name : "AwProccessError", type:"OTHER_ERROR"};
		}
	})
	.then(function(){
		return new Promise(function(resolve) {
			resolve({model: accountModel, operation: operation});
		});
	});
}