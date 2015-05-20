var bcrypt = require('bcrypt');
/**
 * Tworzy profil firmy, może to utworzyć tylko admin
 */
/**
 * Tworzy nowe konto użytkownika w modelu Account. Ten moduł ma tylko zastosowanie dla dodawania nowych kont
 * dla adminstratora profilu lub dla super administratorów (na tym etapie super admin jest z konfigucji a nie bazy), ponieważ pierwsze konto administratora musi być utworzone jako dodatek do profilu
 * w transakcji, a konta zwykłych użytkowników są tworzone w transakcji z ProjectAccount,
 * profil lidera tworzony jest w transakcji z project i projectaccount a więc w innych modułach
 * @param  {
 *         firstname?:string,
 *         lastname?:string,
 *         email?:email,
 *         phone:normalizedphonenumber,//to jest podstawowy identyfikator
 *         profileId?:idprofilu
 *         }   data obiekt z danymi do wypełnienia
 * @param  {Function} cb     [description]
 * @param  {[type]}   models [description]
 * @return {[type]}          [description]
 */
module.exports = function(data, cb, models){
	//TODO: zaślepka dla wysyłania telefonu smsem
	var customerModel;
	models.sequelize.transaction().then(function (t) {
		return models.Account.find({
			where : {
				phone : data.phone
			}
		}, {transaction : t})
		.then(function(account){
			if(account === null){//tworzymy nowe konto
				return models.Account.create({
					firstname : data.firstname,
					lastname : data.lastname,
					email : data.email,
					phone : data.phone,
					ProfileId : data.ProfileId,
					password : bcrypt.hashSync(data.password, 8)
				}, {transaction : t})
				.then(function(accountModel){
					return {
						type : "new",
						AccountId : accountModel.id,
						password : data.password,
						phone : data.phone,
						sendSMS : true
					};
				});
			} else if(account.AccountId === null){
			//znaczy że ne jest adminem i sprawdzamy czy w danym profilu ma jakieś role do projektów,
			//jeśli user będzie miał dodany profil_admina a miał status INACTIVE to należy zmienić go na active i wysłać mu SMS z hasłem
				/* TODO:  sprawdzić we wszystkich Project mających profileId takie samo jak dane czy istnieje rola tego użytkownika */
			} else {//znaczy że jest gdzieć adminiem
				throw {name : "AwProccessError", type:"DUPLICATE_USER"};
			}
		})
		.then(function(accountData){
			t.commit();
			cb(null, accountData);
		})
		.catch(function (err) {
			cb(err);
			t.rollback();
		});
	});

};