/**
 * Moduł tworzy powiązanie między wiadomością a jednym lub więcej photo. Każde powiązanie to osobny wpis.
 * Dodając musimy sprawdzić czy owner miał uprawnienie do tego. Jeśli tak, to dodanie kązdego zdjęcia
 * dodaje nowe uprawnienia dla pozostałych userów w grupie
 * data.ownerId
 * data.recipientListId,
 * data.messageId,
 * data.projectId
 * data.photoListId
 */

module.exports = function(data, transaction, models, actions){
	var ownerRole;
	var ownerFirmname;
	var recipientRoleList = [];
	var subcontractorFirmList = [];
	return models.ProjectAccount.find({
		where:{
			AccountId:data.ownerId,
			ProjectId:data.projectId
		}
	},{transaction : transaction})
	.then(function(role){
		ownerRole = checkGWRole(role.role);
		ownerFirmname = role.firmname;
		return models.ProjectAccount.findAll({
			where:{
				AccountId:{
					in: [data.recipientListId]
				},
				ProjectId:data.projectId
			}
		},{transaction : transaction});
	})
	.then(function(recipientRoleModelList){
		for(var x=0;x<recipientRoleModelList.length; x++){
			var role = checkGWRole(recipientRoleModelList[x].role);
			var firmname = recipientRoleModelList[x].firmname;
			if(role === "SUBCONTRACTOR"){
				if(subcontractorFirmList.indexOf(firmname) === -1){
					subcontractorFirmList.push(firmname);
				}
			}
			if(recipientRoleList.indexOf(role) === -1){
				recipientRoleList.push(role);
			}
		}
	})
	.then(function(){
		return models.sequelize.Promise.map(data.photoListId , function(photoId) {
			var photoPermission = [];
			var photoSubcontractorFirmname = [];
			var photoModel;
			return models.Photo.find({
				where : {
					id : photoId,
					ProjectId : data.projectId
				},
				include :[{
					model : models.PhotoPermission,
				}]
			}, {transaction : transaction})
			.then(function(photo){
				photoModel=photo;
				if(!photoModel || !photoModel.PhotoPermissions){
					throw {name : "AwProccessError", type:"NO_PHOTO"};
				}
				var ownerRight = false;
				for(var i = 0; i < photoModel.PhotoPermissions.length; i++){
					var permission = photoModel.PhotoPermissions[i];
					if(photoPermission.indexOf(permission.role) === -1){
						photoPermission.push(permission.role);
					}
					if(permission.role === "SUBCONTRACTOR"){
						if(photoSubcontractorFirmname.indexOf(permission.firmname) === -1){
							photoSubcontractorFirmname.push(permission.firmname);
						}
					}
					if((ownerRole === "SUBCONTRACTOR" && permission.role === ownerRole && permission.firmname===ownerFirmname) || (ownerRole !== "SUBCONTRACTOR" && permission.role === ownerRole)){
						ownerRight =true;
					}
				}
				if(ownerRight === false){
					throw {name : "AwProccessError", type:"PHOTO_PERMISSION"};
				}
			})
			.then(function(){
				return models.sequelize.Promise.map(recipientRoleList , function(recipientRole) {
					if(recipientRole !== "SUBCONTRACTOR" && photoPermission.indexOf(recipientRole) === -1){
						return models.PhotoPermission.create({
							role: recipientRole,
							PhotoId: photoModel.id
						}, {transaction: transaction});
					}
				});
			})
			.then(function(){
				return models.sequelize.Promise.map(subcontractorFirmList , function(firmname) {
					if(photoSubcontractorFirmname.indexOf(firmname) === -1){
						return models.PhotoPermission.create({
							role: "SUBCONTRACTOR",
							firmname: firmname,
							PhotoId: photoModel.id
						}, {transaction: transaction});
					}
				});
			});
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