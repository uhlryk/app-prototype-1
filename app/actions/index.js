/*jslint node: true */
"use strict";

module.exports = function(config){
	var fs        = require("fs");
	var path      = require("path");
	var actions = {};
	var controllerList = fs.readdirSync(__dirname)
	.filter(function(file) {
		return (file.indexOf(".") !== 0) && (file !== "index.js");
	});
	controllerList.forEach(function(controller) {
		actions[controller] = {};
		var actionPath = path.join(__dirname, controller);
		fs.readdirSync(actionPath)
		.filter(function(file) {
			return (file.indexOf(".") !== 0);
		})
		.forEach(function(file) {
			/**
			 * plik ma formę name1_name2.js
			 * w pierwszej kolejności usuwamy .js
			 * mamy więc name1_name2
			 * następnie zamieniamy to na name1_Name2
			 * na końcu usuwamy _
			 */
			var fileName = file.replace(/\..*$/,"");
			/**
			 *  to poniżej mogło by mieć postać
			 *  actions[controller][fileName] = require(path.join(actionPath, file));
			 *  ale chcemy automatycznie do konfiguracji dodać model z sequelize
			 *  dzięki czemu gd używamy akcji podajemy tylko config i callback, nie musimy
			 *  dodawać modeli
			 *  akcja jest function(config, cb, models) a używamy
			 *  function(config, cb)
			 */
			/**
			 * akcje _action zwracają promise, ogólnie to samo co w callback
			 * @type {[type]}
			 */
			var _action = require(path.join(actionPath, file));
			actions[controller][fileName] = function(data, transaction){
				if(transaction || transaction === false){//jeśli mamy transakcję lub jej nie chcemy - ustawiliśmy false to nie tworzymy nowej transakcji
					return _action(data, transaction, config.models, actions);
				} else {
					return config.models.sequelize.transaction().then(function (transaction) {
						return _action(data, transaction, config.models, actions)
						.then(function(result){
							transaction.commit();
							return new Promise(function(resolve) {
								resolve(result);
							});
						})
						.catch(function (err) {
							transaction.rollback();
							throw err;
						});
					});
				}
			};
		});
	});
	return actions;
};