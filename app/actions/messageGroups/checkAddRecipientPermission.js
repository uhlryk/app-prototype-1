/**
 * Sprawdza czy dana osoba może dodać do grupy inne osoby (grupa może jeszcze nieistnieć, może być)
 * Wszyscy na liście muszą mieć uprawnienie. Jeśli ktoś nie może to całość nie może.
 * Jeśli grupa już istnieje, to na typ poziomie nie sprawdzamy czy dana osoba ma uprawnienie do tej grupy
 * to musimy sprawdzić w innym miejscu.
 *
 * Warunki:
 * wszyscy muszą mieć role w danym projekcie,
 * Muszą być aktywni
 * rola musi być aktywna
 * Następnie zależy od ról użytkowników, jeśli:
 * autor GW to pozostali mają dowolną rolę
 * jęsli inwestor to [GW, inwestor, inspektor, projektant]
 * jeśli inspektor to [GW, inspektor, inwestor, projektant]
 * jeśli projektant to [GW, inspektor, projektant, inwestor]
 * jeśli podwykonawca to [GW, i user tylko z jego grupy]
 * argumenty:
 * data.projectId
 * data.ownerId
 * data.recipientListId
 */

module.exports = function(data, transaction, models, actions){
	var projectId =data.projectId;
	var ownerId = data.ownerId;
	var listId = data.recipientListId;
	return models.Account.find({
		where : {
			id : ownerId
		},
		include : {
			model : models.ProjectAccount,
			where: {
				ProjectId : projectId
			}
		}
	}, {transaction : transaction})
	.then(function(ownerAccount){
		if((ownerAccount && ownerAccount.ProjectAccounts && ownerAccount.ProjectAccounts.some)===false){
			throw {name : "AwProccessError", type:"NO_ROLE"};
		}
		var ownerRole = ownerAccount.ProjectAccounts[0];//obojętnie która bo jeśli są dwie to są one obie w GW, a w tym modelu to nas interesuje
		return models.sequelize.Promise.map(listId , function(accountId) {
			var recipientAccountModel;
			if(ownerId === accountId){
				throw {name : "AwProccessError", type:"OWNER_RECIPIENT"};
			}
			return models.Account.find({
				where : {
					id : accountId
				},
				include : {
					model : models.ProjectAccount,
					where: {
						ProjectId : projectId
					}
				}
			}, {transaction : transaction})
			.then(function(recipientAccount){
				recipientAccountModel = recipientAccount;
				if(recipientAccount && recipientAccount.ProjectAccounts && recipientAccount.ProjectAccounts.some){
					return recipientAccount.ProjectAccounts[0];//obojętnie która bo jeśli są dwie to są one obie w GW, a w tym modelu to nas interesuje
				} else{
					throw {name : "AwProccessError", type:"NO_PROJECT"};
				}
			})
			.then(function(recipientRole){
				switch(ownerRole.role){
					case 'PROFILE_ADMIN':
					case 'PROJECT_LEADER':
					case 'COWORKER':
						//nie sprawdzamy wszystkie role są ok.
					break;
					case 'INVESTOR':
						if(recipientRole.role === 'SUBCONTRACTOR'){
							throw {name : "AwProccessError", type:"ROLE_ADD_ROLE"};
						}
					break;
					case 'INSPECTOR':
						if(recipientRole.role === 'SUBCONTRACTOR'){
							throw {name : "AwProccessError", type:"ROLE_ADD_ROLE"};
						}
					break;
					case 'DESIGNER':
						if(recipientRole.role === 'SUBCONTRACTOR'){
							throw {name : "AwProccessError", type:"ROLE_ADD_ROLE"};
						}
					break;
					case 'SUBCONTRACTOR':
						if((recipientRole.firmname === ownerRole.firmname && recipientRole.role === 'SUBCONTRACTOR') ||
						recipientRole.role === 'PROFILE_ADMIN' || recipientRole.role === 'PROJECT_LEADER' || recipientRole.role === 'COWORKER'){

						} else{
							throw {name : "AwProccessError", type:"ROLE_ADD_ROLE"};
						}
					break;
				}
			});
		});
	});

};