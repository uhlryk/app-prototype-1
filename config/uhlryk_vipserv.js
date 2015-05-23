module.exports = {
	app : {
		env : "development",
		port : 3000,
		name : "BAS API",
		sms : false
	},
	log : {
		mute : false, //log nie będzie wyświetlał requestów na serwer, w praktyce chyba tylko dla testów jest to ok
	},
	db : {
			type : 'mysql',
			host : 'mysql5',
			name : 'uhlryk_bas',//dbname
			user : 'uhlryk_bas',
			pass : 'vds4$#g4ssFF',
			port : '',
			logging : true
	},
	adminAuth : {
		login : "admin@bas.pl",
		pass : "aaaaaa6"
	}
};