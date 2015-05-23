module.exports = {
	app : {
		env : "development",
		port : 3001,
		name : "BAS API",
		sms : false
	},
	log : {
		mute : false, //log nie będzie wyświetlał requestów na serwer, w praktyce chyba tylko dla testów jest to ok
	},
	db : {
			type : '',
			host : '',
			name : '',//dbname
			user : '',
			pass : '',
			port : '',
			logging : true
	},
	adminAuth : {
		login : "",
		pass : ""
	}
};