
var bcrypt = require('bcrypt');
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

	var customerModel;
	models.sequelize.transaction().then(function (t) {
		return models.Account.find({
			where : {
				phone : data.phone
			}
		}, {transaction : t})
		.then(function(account){
			if(customerAccount !== null){
				throw {code : "DUPLICATE_USER"};
			}
		})
		.then(function(){
			return models.Account.create({
				firstname : data.firstname,
				lastname : data.lastname,
				email : data.email,
				phone : data.phone,
				ProfileId : data.ProfileId,
				password : bcrypt.hashSync(data.account.password, 8)
			}, {transaction : t})
			;
		})
		.then(function(){
			t.commit();
			cb({status :200 });
		})
		.catch(models.Sequelize.ValidationError, function (err) {
			t.rollback();
			if(err.name === 'SequelizeUniqueConstraintError'){
				cb({status :422, code : "DUPLICATE_USER"});
			} else {
				cb({status :500});
			}
			console.log(err);
		})
		.catch(function(err){
			t.rollback();
			console.log(err);
			if (err.code){
				cb({status :422, code : err.code});
			} else{
				cb({status :500});
			}
		});
	});

};