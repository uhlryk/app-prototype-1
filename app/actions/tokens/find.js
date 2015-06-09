/**
 * zwraca dane powiązane z tokenem, token użytkownik wysyła do api i wtedy sprawdzamy w tym modelu i dostajemy
 * informacje o użytkowniku
 * data.token
 * return
 * {
 * 	data - obiekt z dowolnymi danymi zapisywanymi w 'sesji'
 * 	type - jeśli 'SUPER' to mamy doczynienia z super adminem. Pozostali mają 'USER'
 * 	AccountId - id konta usera, superadmin ma null
 * 	Account : { szczegóły konta użytkownika, super admin ma null, są tylko aktywne konta brane
 * 		id - to samo co AccountId
 * 		phone - login usera
 * 		ProfileId - id profilu, tą wartość ma tylko administrator profilu - jedno powiązanie maksymalnie
 * 		ProjectAccounts : {[ - lista ról we wszystkich projektach, może być [] przy braku ról, są tylko aktywne role brane
 * 			role - rola usera w projekcie,
 * 			firmname - jaka firma jest usera w tej roli, niektóre uprawnienia tego wymagają
 * 			ProjectId - id projektu
 * 			Project { - szczegóły projektu, wszystkie projekty brane
 * 				status - ACTIVE | DISABLE
 * 				package - jaki pakiet 'BASIC' | 'PROFESSIONAL'
 * 				mode - w jakim trybie jest projekt 'INIT' | 'BUILD' | 'SERVICE' | 'FINISH'
 * 				start_date - data rozpoczęcia projektu
 * 				finish_date - data zakończenia fazy budowy
 * 				warranty_date - data końca serwisowania
 * 				paid_date - data do której jest opłacony projekt
 * 				ProfileId - id profilu do którego należy ten projekt
 * 				Profile { szczegóły profilu do którego należy konto, brane są wszystkie profile
 * 					status - ACTIVE | DISABLE
 * 				}
 * 			}
 * 		]}
 * 	}
 * }
 *	lub null
 */
module.exports = function(data, transaction, models, actions){
	return models.Token.find({
		where : {
			token : data.token,
			status : "ACTIVE"
		},
		attributes:['data', 'type', 'AccountId'],
		include : [{
			model: models.Account,
			where : {
				status : 'ACTIVE'
			},
			attributes : ['id','phone','ProfileId'],
			required: false,
			include : [{
				model: models.ProjectAccount,
				where : {
					status : 'ACTIVE'
				},
				attributes: ['role', 'ProjectId', 'firmname'],
				required: false,
				include : [{
					model : models.Project,
					attributes: ['status','package', 'mode', 'start_date', 'finish_date', 'warranty_date', 'paid_date', 'ProfileId'],
					required: false,
					include : [{
						model : models.Profile,
						attributes: ['status'],
						required: false
					}]
				}]
			}],
		}],
	}, {transaction : transaction})
	.then(function(tokenModel){
		var tokenData = null;
		if(tokenModel){
			tokenData = tokenModel.toJSON();
			// console.log("------------------");
			// console.log(JSON.stringify(tokenData));
			// console.log("------------------");
		}
		return new Promise(function(resolve) {
			resolve(tokenData);
		});
	});
};