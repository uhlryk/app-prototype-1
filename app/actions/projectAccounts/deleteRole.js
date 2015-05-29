/**
 * Moduł usuwa wszystkie role użytkownika w projekcie.
 * Nie można usunąć tylko roli PROFILE_ADMIN,
 * data.transaction dodajemy transakcję
 * data.projectId id projektu w którym ma zostać usunięta rola
 * data.accountId id konta którego role mają być w projekcie usunięte.
 * return
 * [{operation:[DISABLE | NOT_CHANGE_PROFILE_ADMIN], model:projectAccountModel}]
 * zwraca listę obiektów odpowiadających rolom jakie mogły być usunięte. Obiekty na liście mają strukturę
 * {operation:[DISABLE | NOT_CHANGE_PROFILE_ADMIN], model:projectAccountModel}
 */
module.exports = function(data, transaction, models, actions){
	var roleList = [];
	return models.ProjectAccount.findAll({//wszystkie role w projekcie wyciągamy
		where : {
			status : "ACTIVE",
			ProjectId : data.projectId,
			AccountId : data.accountId
		}
	}, {transaction : transaction})
	.then(function(projectAccountList){
		if(projectAccountList === null){//jest dobrze nie ma żadnych ról
			//dany użytkownik nie ma ról do usunięcia
		} else {
			return models.sequelize.Promise.map(projectAccountList, function(projectAccount) {
				if(projectAccount.role === 'PROFILE_ADMIN'){//tej roli nie usuwamy
					roleList.push({operation: 'NOT_CHANGE_PROFILE_ADMIN', model: projectAccount});
				} else {//user ma inną rolę niż PROFILE_ADMIN lub docelowa rola jest inna niż PROJECT_LEADER
					roleList.push({operation: 'DISABLE', model: projectAccount});
					return projectAccount.updateAttributes({
						status : "DISABLE",
					}, {transaction : transaction});
				}
			});
		}
	})
	.then(function(){
		return new Promise(function(resolve){
			resolve(roleList);
		});
	});
};