var bcrypt = require('bcrypt');
/**
 * Tworzy projekt dla danego profilu
 * DOdatkowo tworzy konto lidera. musi sprawdzić czy lider istnieje
 * data.phone
 * data.firstname?
 * data.lastname?
 * data.email?
 * data.password
 * data.name
 * data.package
 * data.profileId
 * return
 * {accountModel: accountModel, projectModel:projectModel, accountOperation: [CREATE_NEW | ACTIVE_PROPOSITION | ACTIVE], password: password}
 */
module.exports = function(data, transaction, models, actions){
	var accountOperation;
	var accountModel;
	var projectModel;
	var password;

	return models.Project.create({
		name : data.name,
		ProfileId : data.profileId,
		package : data.package
	}, {transaction : transaction})
	/**
	 * Na tym etapie mamy projekt któremu zmieniliśmy tryb na SERVICE
	 * Teraz jeśli jest taka potrzeba dodamy nowego PROJECT_LEADER
	 */
	.then(function(project){
		projectModel = project;
		return actions.projectAccounts.createProjectLeader({
			transaction: transaction,
			firstname : data.firstname,
			lastname : data.lastname,
			email : data.email,
			phone : data.phone,
			password : data.password,
			projectId : project.id,
		}, transaction);
	})
	.then(function(resultData){
		accountOperation = resultData.operation;
		accountModel = resultData.model;
		password = resultData.password;
	})
	.then(function(){
		return actions.projectAccounts.addAllProfileAdminOneProject({
			projectId : projectModel.id
		}, transaction);
	})
	.then(function(){
		return new Promise(function(resolve){
			resolve({
				projectModel: projectModel,
				accountModel: accountModel,
				accountOperation: accountOperation,
				password : password
			});
		});
	});
};