/**
 * po utworzeniu projektu określony typ użytkownika moze go skonfigurować
 * @param  {[type]}   data   [description]
 * @param  {Function} cb     [description]
 * @param  {[type]}   models [description]
 * @return {[type]}          [description]
 */
module.exports = function(data, transaction, models, actions){
	return models.Project.update({
		start_date : data.start_date,
		finish_date : data.finish_date,
		investor_firmname : data.investor_firmname,
		mode : 'BUILD'
	},{
		where : {
			id : data.projectId,
			status : 'ACTIVE',
			mode : 'INIT'
		},
		transaction : transaction
	})
	.then(function(projectList){
		if(projectList[0] === 0){//update zwraca tablicę 1 lub dwu elementową gdzie pierwszy element oznacza liczę krotek zmienionych, jeśli 0 to znaczy że nie doszło do update
			throw {name : "AwProccessError", type:"INVALID_PROJECT"};
		}
		return new Promise(function(resolve){
			resolve(data.projectId);
		});
	});
};