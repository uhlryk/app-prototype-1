/**
 * Gdy tworzymy nowego profileadmina musimy go dodać do wszystkich projektów-profili z nim powiązanych
 * data.accountId
 */
module.exports = function(data, transaction, models, actions){
	/**
	 * pobieramy dane dla danego konta powiązane z profilem>projektami>rolami
	 */
	return models.Account.findOne({
		where : {
			id : data.accountId
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
				model: models.Project,
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
						AccountId: data.accountId
					},
				}]
			}]
		}]
	}, {transaction : transaction})
	/**
	 * mamy listę wszyskich projektów jakie są w danym profilu i ról tego usera w tych projekatach
	 */
	.then(function(account){
		// if(account){
		// 	console.log(account.toJSON());
		// }
		if(account && account.Profile && account.Profile.Projects){
			return models.sequelize.Promise.map(account.Profile.Projects , function(project) {
				var canCreateRole = true;
				if(project && project.ProjectAccounts  && project.ProjectAccounts.length > 0){
					/**
					 * w danym projekcie user ma jakieś role. sprawdzamy jakie,
					 * jeśli jest to inna rola niż PROJECT_LEADER czy PROFILE_ADMIN to wywalamy błąd
					 * jeśli jest to tylko PROJECT_LEADER to canAddRole = true
					 * jeśli jest też PROFILE_ADMIN to canAddRole = false
					 */
					for(var i in project.ProjectAccounts){
						var roleData = project.ProjectAccounts[i];
						if(roleData.role !== 'PROFILE_ADMIN' && roleData.role !== 'PROJECT_LEADER'){
							throw {name : "AwProccessError", type:"ROLE_ERROR"};
						}else if(roleData.role === 'PROFILE_ADMIN'){
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
						AccountId : data.accountId
					}, {transaction : transaction});
				}
			});
		}
	});
};
