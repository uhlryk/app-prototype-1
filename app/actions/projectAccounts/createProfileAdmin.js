var bcrypt = require('bcrypt');
/**
 * Tworzy profil firmy, może to utworzyć tylko admin
 */
/**
 * Moduł tworzy w projekcie PROFILE_ADMIN
 * data.profileId id profilu dla którego ma być ustawiony admin
 * dane dla nowego leadera
 * data.phone
 * data.firmname
 * opcjonalne:
 * data.firstname
 * data.lastname
 * data.email
 * data.password
 * return
 * {model: accountModel, operation: [CREATE_NEW | ACTIVE_PROPOSITION | ACTIVE], password:password}
 */
module.exports = function(data, transaction, models, actions){
	var operation;
	var accountModel;
	var password;
	return actions.accounts.create({
		firstname : data.firstname,
		lastname : data.lastname,
		email : data.email,
		phone : data.phone,
		firmname: data.firmname,
		password : data.password,
		profileId : data.profileId,
		status : 'ACTIVE'
	}, transaction)
	.then(function(resultData){
		password = resultData.password;
		operation = resultData.operation;
		accountModel = resultData.model;
		if(operation === 'PROPOSITION'){//istnieje konto ale jest ono jeszcze nieaktywne
			operation = 'ACTIVE_PROPOSITION';
			return accountModel.updateAttributes({
				status : "ACTIVE",
			}, {transaction : transaction});
		} else if(operation === 'ACTIVE'){
			if(accountModel.ProfileId){
				/**
				 * Dane konto ma już przypisany profile - ma rolę PROFILE_ADMIN
				 */
				throw {name : "AwProccessError", type:"ROLE_ERROR"};
			} else {
				/**
				 * trzeba sprawdzić czy user ma role w jakimś projekcie tego profilu,
				 * ale nie będzie to robione na tym etapie tylko moduł addOneProfileAdminAllProject
				 * używany poniżej
				 * przy dodawaniu ról profileadmina sprawdza czy już to nie jest zablokowane
				 */
			}
		} else if(operation === 'CREATE_NEW'){
			/**
			 * nowe AKTYWNE nic nie trzeba z nim robić
			 */
		} else {
			/**
			 * Fallback gdyby pojawił się jakiś inny status
			 */
			throw {name : "AwProccessError", type:"OTHER_ERROR"};
		}
	})
	.then(function(){
		/**
		 * utworzyliśmy usera PROFILE_ADMIN teraz musimy dodać tą rolę do wszystkich projektów w których jest adminem
		 * moduł dodatkowo sprawdzi czy w którymś z projektów już nie ma jakiejś innej roli.
		 * Może mieć tylko rolę PROJECT_LEADER jeśli będzie inna to błą∂
		 */
		return actions.projectAccounts.addOneProfileAdminAllProject({
			accountId  : accountModel.id
		}, transaction);
	})
	.then(function(){
		return new Promise(function(resolve) {
			resolve({model: accountModel, operation: operation, password: password});
		});
	});
};