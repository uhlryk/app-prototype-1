module.exports = {
	app : {
		env : "development",
		port : 3001,
		name : "BAS API"
	},
	log : {
		mute : false, //log nie będzie wyświetlał requestów na serwer, w praktyce chyba tylko dla testów jest to ok
	},
	db : {
			type : 'mysql',
			host : 'localhost',
			name : 'bas',
			user : 'root',
			pass : 'root',
			port : '8889',
			logging : true
	},
	adminAuth : {
		login : "admin@bas.pl",
		pass : "aaaaaa6"
	}
};