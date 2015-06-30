/**
 * Moduł przypisuje konto usera do danej korespondencji. Na tym etapie nie sprawdzamy czy userzy mogą być w tej
 * korespondencji
 * argumenty:
 * data.messageGroupId
 * data.accountId
 */

module.exports = function(data, transaction, models, actions){
	return models.MessageGroupAccount.create({
		MessageGroupId : data.messageGroupId,
		AccountId : data.accountId,
	},{transaction : transaction})
	.then(function(groupAccount){
		return new Promise(function(resolve) {
			resolve({model: groupAccount});
		});
	});
};