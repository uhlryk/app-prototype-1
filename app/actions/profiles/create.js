/**
 * Tworzy profil firmy
 * data.firmname
 * data.nip
 * data.street_address
 * data.house_address
 * data.flat_address
 * data.zipcode_address
 * data.city_address
 * return
 * {id : profileId}
 */

module.exports = function(data, transaction, models, actions){
	return models.Profile.create({
		firmname : data.firmname,
		nip : data.nip,
		street_address : data.street_address,
		house_address : data.house_address,
		flat_address : data.flat_address,
		zipcode_address : data.zipcode_address,
		city_address : data.city_address,
	}, {transaction : transaction})
	.then(function(profileModel){
		return new Promise(function(resolve) {
			resolve({id : profileModel.id});
		});
	});
};