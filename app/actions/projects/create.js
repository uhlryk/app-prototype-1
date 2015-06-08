var bcrypt = require('bcrypt');
/**
 * Tworzy projekt dla danego profilu
 * DOdatkowo tworzy konto lidera. musi sprawdzić czy lider istnieje
 * data.phone
 * data.firstname?
 * data.lastname?
 * data.email?
 * data.firmname
 *
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
		name : data.projectname,
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
			firstname : data.firstname,
			lastname : data.lastname,
			email : data.email,
			firmname : data.firmname,
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
		return models.Category.create({ProjectId : projectModel.id, type: "WAY_OF_MAKING", mode: "BUILD", name: "sposób wykonania", priority: 0}, {transaction : transaction});
	})
	.then(function(){
		return models.Category.create({ProjectId : projectModel.id, type: "TO_RECEIVE", mode: "BUILD", name: "do odbioru", priority: 1}, {transaction : transaction});
	})
	.then(function(){
		return models.Category.create({ProjectId : projectModel.id, type: "FAULT", mode: "BUILD", name: "usterka", priority: 2}, {transaction : transaction});
	})
	.then(function(){
		return models.Category.create({ProjectId : projectModel.id, type: "ADVANCEMENT", mode: "BUILD", name: "zaawansowanie prac", priority: 3}, {transaction : transaction});
	})
	.then(function(){
		return models.Category.create({ProjectId : projectModel.id, type: "BHP", mode: "BUILD", name: "BHP", priority: 4}, {transaction : transaction});
	})
	.then(function(){
		return models.Category.create({ProjectId : projectModel.id, type: "PROJECT_ISUE", mode: "BUILD", name: "problemy projektowe", priority: 5}, {transaction : transaction});
	})
	.then(function(){
		return models.Category.create({ProjectId : projectModel.id, type: "DOC_SCAN", mode: "BUILD", name: "skanery pism", priority: 6}, {transaction : transaction});
	})
	.then(function(){
		return models.Category.create({ProjectId : projectModel.id, type: "INNOVATION", mode: "BUILD", name: "pokaż innowacje", priority: 7}, {transaction : transaction});
	})
	.then(function(){
		return models.Category.create({ProjectId : projectModel.id, type: "DELIVERY", mode: "BUILD", name: "dostawy", priority: 8}, {transaction : transaction});
	})
	.then(function(){
		return models.Category.create({ProjectId : projectModel.id, type: "DISORDER", mode: "BUILD", name: "nieporządek", priority: 9}, {transaction : transaction});
	})
	.then(function(){
		return models.Category.create({ProjectId : projectModel.id, type: "FAULT", mode: "SERVICE", name: "usterka", priority: 0}, {transaction : transaction});
	})
	.then(function(){
		return models.Category.create({ProjectId : projectModel.id, type: "REPORT", mode: "SERVICE", name: "zgłoś usunięcie", priority: 1}, {transaction : transaction});
	})
	.then(function(){
		return models.Category.create({ProjectId : projectModel.id, type: "REPAIR_FLOW", mode: "SERVICE", name: "przebieg prac naprawczych", priority: 2}, {transaction : transaction});
	})
	.then(function(){
		return models.Category.create({ProjectId : projectModel.id, type: "DOC_SCAN", mode: "SERVICE", name: "skanery pism", priority: 3}, {transaction : transaction});
	})
	.then(function(){
		return models.Category.create({ProjectId : projectModel.id, type: "BHP", mode: "SERVICE", name: "BHP", priority: 4}, {transaction : transaction});
	})
	.then(function(){
		return models.Category.create({ProjectId : projectModel.id, type: "PROJECT_ISUE", mode: "SERVICE", name: "problemy projektowe", priority: 5}, {transaction : transaction});
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