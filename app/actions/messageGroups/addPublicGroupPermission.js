/**
 * moduł na podstawie listy id userów tworzy brakujące uprawnienia ról
 * jeśli grupa dopiero co zostałą dodana to utworzy nowe permissiony
 * data.accountListId lista wszystkich userów którzy mają dostęp do grupy - autor tez
 * data.messageGroupId
 * data.projectId
 */

module.exports = function(data, transaction, models, actions){
	var accountRoleList = [];
	var subcontractorFirmList = [];
	return models.ProjectAccount.findAll({
		where:{
			AccountId:{
				in: [data.accountListId]
			},
			ProjectId:data.projectId
		}
	},{transaction : transaction})
	.then(function(roleModelList){
		for(var i=0;i<roleModelList.length; i++){
			var role = checkGWRole(roleModelList[i].role);
			var firmname = roleModelList[i].firmname;
			if(role === "SUBCONTRACTOR"){
				if(subcontractorFirmList.indexOf(firmname) === -1){
					subcontractorFirmList.push(firmname);
				}
			} else if(accountRoleList.indexOf(role) === -1){
				accountRoleList.push(role);
			}
		}
	})
	.then(function(){
		return models.sequelize.Promise.map(accountRoleList , function(role) {
			return models.MessageGroupPermission.create({
				role: role,
				MessageGroupId: data.messageGroupId
			},{transaction : transaction});
		});
	})
	.then(function(){
		return models.sequelize.Promise.map(subcontractorFirmList , function(firmname) {
			return models.MessageGroupPermission.create({
				role: "SUBCONTRACTOR",
				firmname: firmname,
				MessageGroupId: data.messageGroupId
			},{transaction : transaction});
		});
	});
};
function checkGWRole(role){
	if(role === "PROJECT_LEADER" || role === "PROFILE_ADMIN" || role === "COWORKER"){
		return "GW";
	} else{
		return role;
	}
}