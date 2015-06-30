/**
 * Odpowiada za wysyłanie smsów, a w trybie debug, tylko je zapamiętuje i pozwala zwrócić
 */
module.exports = function(isActive) {
	var accountSid = 'AC32a3c49700934481addd5ce1659f04d2';
	var authToken = "{{ auth_token }}";
	var client = require('twilio')(accountSid, authToken);

	var apPhone = "+14158141829";
	var manager = {};
	if(isActive === false){
		manager.list = {};
		manager.send = function(phone, data, cb){
			manager.list[phone] = data;
			cb(null, null);
		};
		manager.get = function(phone){
			if(phone === "+48802001001"){
				console.log("-----");
				console.log(manager.list);
			}
			return manager.list[phone];
		};
	} else {
		manager.send = function(phone, data, cb){//cb = function(err,message)
			client.messages.create({
					body: "test",
					to: phone,
					from: apPhone
			}, cb);
		};
	}
	return manager;
};