var bcrypt = require('bcrypt');
/**
 * Tworzy projekt dla danego profilu
 * DOdatkowo tworzy konto lidera. musi sprawdzić czy lider istnieje
 *
 * @param  {
 *         name : nazwa danego projektu
 *         package: 'BASIC', 'PROFESSIONAL'
 *         profileId:idprofilu
 *
 *         firstname?:string,
 *         lastname?:string,
 *         email?:email,
 *         phone:normalizedphonenumber,//to jest podstawowy identyfikator
 *         }   data obiekt z danymi do wypełnienia
 * @param  {Function} cb     [description]
 * @param  {[type]}   models [description]
 * @return {[type]}          [description]
 */
module.exports = function(data, transaction, models, actions){
	var modelData;
	var sendSMS = false;
	var accountId, projectId;
	return models.Account.find({
		where : {
			phone : data.phone
		}
	}, {transaction : transaction})
	.then(function(account){
		if(account === null){//tworzymy nowe konto
			return models.Account.create({
				firstname : data.firstname,
				lastname : data.lastname,
				email : data.email,
				phone : data.phone,
				password : bcrypt.hashSync(data.password, 8)
			}, {transaction : transaction})
			.then(function(account){
				modelData = {
					AccountId : account.id,
					firstname : account.firstname,
					lastname : account.lastname,
					password : data.password,
					phone : data.phone,
					sendSMS : true
				};
			});
		} else if(account.status === 'DISABLE'){
			//todo:testy gdy lider istnieje ale jest zablokowany
			throw {name : "AwProccessError", type:"DISABLE_USER"};
		} else if(account.status === 'INACTIVE'){//znaczy że user był tworzony na potrzeby innego zadania ale jego konto nie zostało aktywowane, bo powstało tylko jako propozycja której nikt nie zatwierdził
			//test gdy lider istnieje ale jest nieaktywny
			return account.updateAttributes({
				status : "ACTIVE",
				password : bcrypt.hashSync(data.password, 8)
			}, {transaction : transaction})
			.then(function(account){
				modelData = {
					AccountId : account.id,
					firstname : account.firstname,
					lastname : account.lastname,
					password : data.password,
					phone : data.phone,
					sendSMS : true
				};
			});
		} else if(account.status === 'ACTIVE'){//konto jest w porządku
			modelData = {
				AccountId : account.id,
				phone : data.phone,
				sendSMS : false
			};
			return account;
		} else {//gdy np status inny
			throw {name : "AwProccessError", type:"OTHER_ERROR"};
		}
	})
	.then(function(){
		accountId = modelData.AccountId;
		return models.Project.create({
			name : data.name,
			ProfileId : data.ProfileId,
			package : data.package
		}, {transaction : transaction});
	})
	.then(function(project){
		projectId = project.id;
		return models.ProjectAccount.create({
			ProjectId : project.id,
			AccountId : accountId,
			status : 'ACTIVE',
			role : 'PROJECT_LEADER'
		}, {transaction : transaction});
	})
	.then(function(){
		modelData.ProjectId = projectId;
		return new Promise(function(resolve) {
			resolve(modelData);
		});
	});
};