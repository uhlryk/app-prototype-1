//remove
/**
 * zwraca account wraz z ProjectAccount i Project do lidera danego projektu
 * jest źle bo na poziomie ProjectAccount
 */
module.exports = function(data, transaction, models, actions){
	return models.Project.find({
		where : {
			id : data.projectId,
		},
		include : [{
			model: models.ProjectAccount,
			where : {
				role : 'PROJECT_LEADER',
				status : 'ACTIVE'
			},
			include:[models.Account]
		}],
	}, {transaction:transaction})
	.then(function(projectModel){
		return new Promise(function(resolve){
			resolve(projectModel);
		});
	});
};