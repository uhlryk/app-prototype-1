/**
 * zwraca account wraz z ProjectAccount i Project do lidera danego projektu
 */
module.exports = function(projectId, cb, models){
	return models.Project.find({
		where : {
			id : projectId,
		},
		include : [{
			model: models.ProjectAccount,
			where : {
				role : 'PROJECT_LEADER'
			},
			include:[models.Account]
		}],
	}, {raw:true})
	.then(function(projectModel){
		if(projectModel === null){
			cb(null, null);
		}else {
			cb(null, projectModel);
		}
	})
	.catch(function (err) {
		cb(err);
	});
};