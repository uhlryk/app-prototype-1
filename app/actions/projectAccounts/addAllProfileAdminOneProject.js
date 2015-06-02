/**
 * Gdy tworzymy nowy projekt trzeba wszystkich profileAdminów powiązanych z danym projektem-profilem dodać jako role
 * data.projectId
 */
module.exports = function(data, transaction, models, actions){
	/**
	 * pobieramy dane dla danego projektu powiązane z profilem>kontami>rolami
	 */
	return models.Project.findOne({
		where : {
			id : data.projectId
		},
		attributes:['id'],
		include :[{//single
			attributes:['id'],
			model : models.Profile,
			required: false,
			where : {
				status : 'ACTIVE'
			},
			include : [{//plural
				attributes:['id'],
				model: models.Account,
				required: false,
				where : {
					status : 'ACTIVE'
				},
				include : [{//plural
					attributes:['role'],
					model: models.ProjectAccount,
					required: false,
					where : {
						status : 'ACTIVE',
						ProjectId: data.projectId
					},
				}]
			}]
		}]
	}, {transaction : transaction})
	/**
	 * mamy listę wszyskich profileadminów jacy są w danym profilu i ich ról w danym projekcie
	 */
	.then(function(project){
		if(project && project.Profile && project.Profile.Accounts){//wszystkie konta które sa PROFILE_ADMIN dla tego profilu
			return models.sequelize.Promise.map(project.Profile.Accounts , function(account) {
				var canCreateRole = true;
				if(account && account.ProjectAccounts  && account.ProjectAccounts.length > 0){
					/**
					 * znaczy że ten PROFILE_ADMIN ma jakieś role w danym projekcie
					 * sprawdźmy role i jeśli jest rola PROFILE_ADMIN to canCreateRole = false
					 */
					for(var i in account.ProjectAccounts){
						var roleData = account.ProjectAccounts[i];
						if(roleData.role === 'PROFILE_ADMIN'){
							canCreateRole = false;
							break;
						}
					}
				}
				if(canCreateRole){
					/**
					 * można dodać userowi rolę admina profilu dla danego projektu
					 */
					return models.ProjectAccount.create({
						status: 'ACTIVE',
						role : 'PROFILE_ADMIN',
						ProjectId : project.id,
						AccountId : account.id
					}, {transaction : transaction});
				}
			});
		}
	});
};
