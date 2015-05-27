/**
 * superadmin może ustawić by projekt był aktywny lub zablokowany
 */
module.exports = function(data, cb, models){
	models.sequelize.transaction().then(function (t) {
		return models.Project.update({
			status : data.status,
		},{
			where : {
				id : data.ProjectId,
			},
			transaction : t
		})
		.then(function(projectList){
			if(projectList[0] === 0){//update zwraca tablicę 1 lub dwu elementową gdzie pierwszy element oznacza liczę krotek zmienionych, jeśli 0 to znaczy że nie doszło do update
				throw {name : "AwProccessError", type:"INVALID_PROJECT"};
			}
			t.commit();
			cb(null, data.ProjectId);
		})
		.catch(function (err) {
			t.rollback();
			cb(err);
		});
	});
};