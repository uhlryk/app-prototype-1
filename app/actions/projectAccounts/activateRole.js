/**
 * rolę która ma status PROPOSITION zamienia na ACTIVE role musi być typu
 * 'COWORKER', 'INVESTOR', 'INSPECTOR', 'DESIGNER', 'SUBCONTRACTOR'
 * w danym projekcie konto może mieć tylko jedna rola,
 * wyjątkiem jest PROFILE_ADMIN który może mieć jeszcze rolę PROJECT_LEADER
 * a PROFILE_ADMIN i PROJECT_LEADER zawsze są ACTIVE, nigdy proposition
 * dlatego dla danej roli sprawdzamy czy w projekcie jej konto występuje ACTIVE
 * jeśli tak to błąd, jeśli nie to zmieniamy daną rolę na ACTIVE
 * data.projectAccountId
 * data.projectId
 */
module.exports = function(data, transaction, models, actions){
	return models.ProjectAccount.find({//wszystkie role w projekcie wyciągamy
		where : {
			id : data.projectAccountId,
			ProjectId : data.projectId,
			status : 'PROPOSITION'
		},
		include : [{
			model : models.Project,
			where: {	//to obowiązkowe, jeśli nie znajdzie dopasowania status=ACTIVE to wywalamy błąd że nie ma statusu
				status : 'ACTIVE'
			},
			include : [{//dla danego projektu zwracamy aktywne konta
				model : models.ProjectAccount,
				where : {
					status : 'ACTIVE'
				}
			}]
		}]
	}, {transaction : transaction})
	.then(function(projectAccount){
		if(projectAccount && projectAccount.Project && projectAccount.Project.ProjectAccounts){
				if(projectAccount.Project.ProjectAccounts.length > 0){
					/**
					 * sprawdzamy wszystkie aktywne role w projekcie dla tego usera, jeśli jakieś ma to błąd
					 */
					for(var i in projectAccount.Project.ProjectAccounts){
						var roleData = projectAccount.Project.ProjectAccounts[i];
						if(roleData.id === projectAccount.id){
							throw {name : "AwProccessError", type:"ROLE_ERROR"};
						}
					}
				}
				return projectAccount.updateAttributes({
					status : "ACTIVE",
				}, {transaction : transaction});
		} else{
			throw {name : "AwProccessError", type:"INVALID_PROJECT_ROLE"};
		}
	})
	;
};