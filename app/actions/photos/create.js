/**
 * Tworzy zdjęcie usera w bazie i dodaje podstawowe uprawnienia
 * data.name
 * data.mimetype
 * data.size
 * data.accountId
 * data.projectId
 * data.categoryType
 * return
 * {photoModel, permissionModel}
 */

module.exports = function(data, transaction, models, actions){
	var photoModel;
	var permissionModel;
	var categoryModel;
	return models.Category.find({//wszystkie role w projekcie wyciągamy
		where : {
			type : data.categoryType,
			ProjectId : data.projectId,
		},
		include :[{
			model : models.Project,
			where: {	//to obowiązkowe, jeśli nie znajdzie dopasowania status=ACTIVE to wywalamy błąd że nie ma statusu
				status : 'ACTIVE'
			},
			include : [{
				model : models.ProjectAccount,
				where: {
					AccountId : data.accountId
				}
			}]
		}]
	}, {transaction : transaction})
	.then(function(category){
		categoryModel = category;
		if(category === null){//jest dobrze nie ma żadnych ról
			throw {name : "AwProccessError", type:"INVALID_PROJECT"};
		}
		return models.Photo.create({
			name : data.name,
			mimetype : data.mimetype,
			size : data.size,
			CategoryId : categoryModel.id,
			ProjectId : data.projectId,
			AccountId: data.accountId
		}, {transaction : transaction});
	})
	.then(function(photo){
		photoModel = photo;
		var role = categoryModel.Project.ProjectAccounts[0];
		var permissionRole;
		var permissionFirmname = null;
		if(role.role === 'SUBCONTRACTOR'){
			permissionRole = role.role;
			permissionFirmname = role.firmname;
		} else if(role.role === "COWORKER" || role.role === "PROJECT_LEADER" || role.role === "COWORKER"){
			permissionRole = "GW";
		} else {
			permissionRole = role.role;
		}
		return models.PhotoPermission.create({
			role: permissionRole,
			firmname: permissionFirmname,
			PhotoId: photoModel.id
		}, {transaction: transaction});
	})
	.then(function(permission){
		permissionModel = permission;
		return new Promise(function(resolve){
			resolve({
				photoModel: photoModel,
				permissionModel: permissionModel
			});
		});
	});
};