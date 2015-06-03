/**
 * Moduł zmienia status projectu z BUILD na SERVICE, pozwala również ustawić nowego PROJECT_LEADER lub zostawić starego
 * data.transaction dodajemy transakcję
 * data.projectId id projektu dla którego ma być ustawiony leader
 * data.warranty jak długo projekt jest na gwarancji, z poziomu aplikacji nie powoduje to nowych funkcjonalności
 * data.isNewLeader jeśli true to będzie zmieniany user, jeśli false to zostanie stary
 * dane dla nowego leadera wymagane tylko jeśli data.isNewLeader = true
 * data.phone
 * opcjonalne:
 * data.firstname
 * data.lastname
 * data.email
 * data.firmname
 * data.password
 * return
 * {accountModel: accountModel, projectModel:projectModel, accountOperation: [CREATE_NEW | ACTIVE_PROPOSITION | ACTIVE]}
 */
module.exports = function(data, transaction, models, actions){
	var accountOperation;
	var projectModel;
	var accountModel;
	/**
	 * Wyciągamy projekt na podstawie id który chcemy zmienić
	 */
	return models.Project.find({
		where : {
			status : "ACTIVE",
			mode : 'BUILD',
			id : data.projectId,
		}
	}, {transaction : transaction})
	.then(function(project){
		projectModel = project;
		if(project === null){//jest dobrze nie ma żadnych ról
			throw {name : "AwProccessError", type:"INVALID_PROJECT"};
		} else {
			return project.updateAttributes({
				mode : "SERVICE",
				warranty : data.warranty
			}, {transaction : transaction});
		}
	})
	/**
	 * Na tym etapie mamy projekt któremu zmieniliśmy tryb na SERVICE
	 * Teraz jeśli jest taka potrzeba dodamy nowego PROJECT_LEADER
	 */
	.then(function(){
		if(data.isNewLeader)
		{//zmieniamy PROJECT_LEADER
			return actions.projectAccounts.createProjectLeader({
				transaction: transaction,
				firmname : data.firmname,
				firstname : data.firstname,
				lastname : data.lastname,
				email : data.email,
				phone : data.phone,
				password : data.password,
				projectId : data.projectId,
			}, transaction)
			.then(function(resultData){
				accountOperation = resultData.operation;
				accountModel = resultData.model;
			});
		} else {//zostaje stary PROJECT_LEADER nic więc nie robimy

		}
	})
	.then(function(){
		return new Promise(function(resolve){
			resolve({
				projectModel: projectModel,
				accountModel: accountModel,
				accountOperation: accountOperation
			});
		});
	});
};