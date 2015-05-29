/**
 * superadmin może ustawić by projekt był aktywny lub zablokowany
 * data.status
 * data.projectId
 * return
 * projectId
 */
module.exports = function(data, transaction, models, actions){
	return models.Project.update({
		status : data.status,
	},{
		where : {
			id : data.projectId,
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