/**
 * Tworzy konto użytkownika razem z rolą do danego projektu
 * Możliwe role jakie może utworzyć ten moduł
 * 'COWORKER', 'INVESTOR', 'INSPECTOR', 'DESIGNER', 'SUBCONTRACTOR'
 * data.projectId id projektu dla którego ma być ustawiony leader
 * data.phone
 * data.password
 * data.status
 * data.role
 * opcjonalne:
 * data.firstname
 * data.lastname
 * data.email
 * data.firmname
 * return
 * {model: accountModel, roleModel:role, operation: operation, password: password}
 */
module.exports = function(data, transaction, models, actions){
	var operation;
	var accountModel;
	var password;
	return actions.accounts.create({
		firstname : data.firstname,
		lastname : data.lastname,
		email : data.email,
		firmname : data.firmname,
		phone : data.phone,
		password : data.password,
		status : data.status
	}, transaction)
	.then(function(resultData){
		password = resultData.password;
		operation = resultData.operation;
		accountModel = resultData.model;
		if(operation === 'PROPOSITION'){
			/**
			 * istnieje konto ale jest ono jeszcze nieaktywne, Jeśli nowa próba jest też PROPOSITION to nic nie robimy
			 * jeśli nowa jest ACTIVE to aktywujemy konto (nie aktywujemy roli która jest PROPOSITION)
			 */
			if(data.status === 'PROPOSITION'){
				//nic nie robimy konto było PROPOSITION i teraz się nic nie zmienia
			}else{
				//było PROPOSITION ale teraz mam ACTIVE
				operation = 'ACTIVE_PROPOSITION';
				return accountModel.updateAttributes({
					status : "ACTIVE",
				}, {transaction : transaction});
			}
		} else if(operation === 'ACTIVE'){
			/**
			 * konto jest aktywne nic nie zmieniamy, nawet jeśli teraz jest PROPOSITION, po prostu wtedy rola będzie PROPOSITION
			 */
		} else if(operation === 'CREATE_NEW'){
			/**
			 * nowe konto które jest ACTIVE (jeśli nowe konto było by PROPOSITION to by otrzymało operation=PROPOSITION)
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
		 * mamy konto, teraz tworzymy odpowiednią rolę
		 * poniższy moduł sprawdza czy dane konto ma już rolę w danym projekcie, jeśli tak i jest ACTIVE to error, PROPOSITION przepuszczamy
		 */
		return actions.projectAccounts.createRole({
			projectId:data.projectId,
			role:data.role,
			firstname : data.firstname,
			lastname : data.lastname,
			email : data.email,
			firmname : data.firmname,
			status:data.status,
			accountId:accountModel.id
		}, transaction);
	})
	.then(function(role){
		return new Promise(function(resolve) {
			resolve({accountModel: accountModel, roleModel:role, operation: operation, password: password});
		});
	});
};