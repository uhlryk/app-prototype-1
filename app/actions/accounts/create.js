/**
 * Moduł tworzy nowego usera, wpina się w transakcję
 * data.transaction dodajemy transakcję
 * data.phone niezbędne pole, do identyfikacji i do utworzenia konta
 * opcjonalne:
 * data.firstname
 * data.lastname
 * data.email
 * data.firmname
 * data.password
 * data.status 'ACTIVE','PROPOSITION' czyli czy tworzymy użytkownika czy tylko go proponujemy, domyślnie baza odpali 'ACTIVE'
 * return
 * {model: accountModel, operation: [CREATE_NEW | PROPOSITION | ACTIVE], password: password}
 */

var bcrypt = require('bcrypt');
module.exports = function(data, transaction, models, actions){
	/**
	 * określamy co zostało zrobione z kontem, CREATE_NEW, PROPOSITION, ACTIVE, może się to przydać do kolejnych operacji
	 * np jeśli było PROPOSITION i ACTIVE to należy sprawdzić czy już w danym projekcie nie pełni jakiś ról
	 */
	var operation;
	var accountModel;
	var password = data.password;
	return models.Account.find({
		where : {
			phone : data.phone
		}
	}, {transaction : transaction})
	.then(function(account){
		if(account === null){
			var modelData = {
				firstname : data.firstname,
				lastname : data.lastname,
				email : data.email,
				firmname:data.firmname,
				phone : data.phone,
				password : bcrypt.hashSync(data.password, 8)
			};
			if(data.status){
				modelData.status = data.status;
			}
			if(data.profileId){
				modelData.ProfileId = data.profileId;
			}
			/**
			 * oznacza że nie ma dla danegu telefonu konta, musimy więc utworzyć nowe konto
			 */
			if(data.status){
				operation = 'PROPOSITION';

			} else{
				operation = 'CREATE_NEW';
			}
			return models.Account.create(modelData, {transaction : transaction})
			.then(function(account){
				accountModel  = account;
			});
		} else if(account.status === 'DISABLE'){//konto istnieje ale jest zablokowane
			//todo:testy gdy lider istnieje ale jest zablokowany
			throw {name : "AwProccessError", type:"DISABLE_USER"};
		} else if(account.status === 'PROPOSITION'){
			accountModel = account;
			operation = 'PROPOSITION';
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
			resolve({model: accountModel, operation: operation, password: password});
		});
	});
};