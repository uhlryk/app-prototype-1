/**
 * Moduł tworzy w projekcie PROJECT_LEADER. Jeśli projekt ma już PROJECT_LEADER to stary zostanie
 * zamieniony w COWORKER lub jeśli stary był również PROFILE_ADMIN to zostanie mu usunięta rola PROJECT_LEADER
 * Jeśli konto nowego PROJECT_LEADER nie istnieje to zostanie mu dodana, jeśli PROJECT_LEADER ma inne role w projekcie to będzie
 * throw error, wyjątkiem jest gdy rolą jest PROFILE_ADMIN
 * data.transaction dodajemy transakcję
 * data.projectId id projektu dla którego ma być ustawiony leader
 * dane dla nowego leadera
 * data.phone
 * data.firmname
 * opcjonalne:
 * data.firstname
 * data.lastname
 * data.email
 * data.password
 * return
 * {model: accountModel, operation: [CREATE_NEW | ACTIVE_PROPOSITION | ACTIVE], password: password}
 */

module.exports = function(data, transaction, models, actions){
	var operation;
	var accountModel;
	var password;
	/**
	 * szukamy aktualnego PROJECT_LEADER
	 */
	return models.ProjectAccount.findAll({//wszystkie role w projekcie wyciągamy
		where : {
			status : "ACTIVE",
			ProjectId : data.projectId,
			role : 'PROJECT_LEADER'
		}
	}, {transaction : transaction})
	/**
	 * mamy listę wszyskich leaderów w danym projekcie - ALE POWINIEN BYĆ TYLKO JEDEN LIDER!
	 */
	.then(function(projectAccountList){
		if(projectAccountList === null){//jest dobrze nie ma żadnych ról
			//projekt nie ma przypisanego jeszcze PROJECT_LEADER, np gdy dopiero tworzymy projekt
		} else {
			//projekt ma jednego lub więcej PROJECT_LEADER, poniżej usuwamy im rolę i dajemy rolę COWORKER
			return models.sequelize.Promise.map(projectAccountList, function(projectAccount) {
				actions.projectAccounts.deleteRole({
					projectId: data.projectId,
					accountId: projectAccount.AccountId,
				}, transaction)
				.then(function(affectedRoleList){
					if(affectedRoleList === null){//lista musi mieć minimum jeden element, a max 2
						//błędna sytuacja która nie powinna mieć miejsca nigdy
						throw {name : "AwProccessError", type:"OTHER"};
					}
					var isProfileAdmin = false;//sprawdzamy czy przy usuwaniu pojawiła się rola PROFILE_ADMIN (nie została usunięta)
					affectedRoleList.forEach(function(role){
						if(role.operation === 'NOT_CHANGE_PROFILE_ADMIN'){
							isProfileAdmin = true;
						}
					});
					//jeśli wśród usuwanych ról nie było PROFILE_ADMIN to musimy dać temu userowi nową rolę COWORKER
					//jak był PROFILE_ADMIN to nie został usunięty więc user ma w projekcie rolę
					if(isProfileAdmin === false){
						return actions.projectAccounts.createRole({
							projectId: data.projectId,
							firstname : data.firstname,
							lastname : data.lastname,
							email : data.email,
							firmname:data.firmname,
							role : 'COWORKER',
							status: 'ACTIVE',
							accountId: projectAccount.AccountId
						}, transaction);
					}
				});
			});
		}
	})
	/**
	 * na tym etapie stary PROJECT_LEADER nie pełni tej roli, przypisujemy tę rolę nowemu użytkownikowi
	 */
	.then(function(){
		//najpierw próbujemy utworzyć nowe Account dla użytkownika który ma być liderem (metoda sprawdzi czy konto już ma)
		return actions.accounts.create({
			firstname : data.firstname,
			lastname : data.lastname,
			firmname:data.firmname,
			email : data.email,
			phone : data.phone,
			password : data.password,
			status : 'ACTIVE'
		}, transaction);
	})
	.then(function(resultData){
		operation = resultData.operation;
		accountModel = resultData.model;
		password = resultData.password;
		if(operation === 'PROPOSITION'){//istnieje konto ale jest ono jeszcze nieaktywne
			operation = 'ACTIVE_PROPOSITION';
			return accountModel.updateAttributes({
				status : "ACTIVE",
			}, {transaction : transaction});
		} else{//albo nowe, albo stare, ale ważne że AKTYWNE
		}
	})
	/**
	 * Mamy aktywne konto użytkownka któremu chcemy przypisać rolę PROJECT_LEADER
	 */
	.then(function(){
		return actions.projectAccounts.createRole({
			projectId: data.projectId,
			role : 'PROJECT_LEADER',
			firstname : data.firstname,
			lastname : data.lastname,
			firmname:data.firmname,
			email : data.email,
			status: 'ACTIVE',
			accountId: accountModel.id
		}, transaction);
	})
	.then(function(){
		return new Promise(function(resolve) {
			resolve({model: accountModel, operation: operation, password: password});
		});
	});
};