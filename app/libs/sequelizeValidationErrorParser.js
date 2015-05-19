/**
 * Przekształca błąd otrzymany z sequelize na formę jaką można przerzucić do klienta
 * @param  {[type]} sequelizeError [description]
 * @return {[type]}                [description]
 */
module.exports = function(sequelizeValidationError) {
	if(sequelizeValidationError.name === "SequelizeValidationError"){
		var validationMessage = {
			message : "VALIDATION_ERROR"
		};

		if(sequelizeValidationError.errors !== null && sequelizeValidationError.errors.length > 0){
			validationMessage.errors = [];
			sequelizeValidationError.errors.forEach(function(error){
				var newError = {};
				switch(error.type){
					case "notNull Violation":
						newError.type = "REQUIRE_FIELD";
						newError.field = error.path;
					break;
					default:
						newError.type = "OTHER";//błąd którego nie zamapowaliśmy, klient wyświetlić powinien coś w stylu, wystąpił błąd w polu xxx
						newError.field = error.path;
				}
				validationMessage.errors.push(newError);
			});
			return validationMessage;
		} else {
			return validationMessage;
		}
	} else {
		return {
			message : "OTHER_ERROR"//nie obsłużony błąd
		};
	}

};