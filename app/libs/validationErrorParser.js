/**
 * Przekształca błąd otrzymany z sequelize na formę jaką można przerzucić do klienta
 * @param  {[type]} sequelizeError [description]
 * @return {[type]}                [description]
 */
module.exports = function(errorObject) {
	var validationMessage = {};
	if(errorObject.name === "SequelizeValidationError"){
		validationMessage.message = "VALIDATION_ERROR";
		if(errorObject.errors !== null && errorObject.errors.length > 0){
			validationMessage.errors = [];
			errorObject.errors.forEach(function(error){
				var newError = {};
				switch(error.type){
					case "notNull Violation":
						newError.type = "REQUIRE_FIELD";
						newError.field = error.path;
					break;
					case "Validation error":
						newError.type = "FIELD_VALIDATION_FAILED";
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
	} else if(errorObject.name === "AwValidationError"){
		validationMessage.message = "VALIDATION_ERROR";
		validationMessage.errors = errorObject.errors;
		return validationMessage;
	} else if(errorObject.name === "AwProccessError"){
		validationMessage.message = "PROCESS_ERROR";
		validationMessage.type = errorObject.type;
		return validationMessage;
	} else {
		return {
			message : "OTHER_ERROR"//nie obsłużony błąd
		};
	}

};