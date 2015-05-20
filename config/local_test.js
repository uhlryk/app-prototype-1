module.exports = {
	app : {
		env : "development",
		port : 3010,
		name : "BAS API"
	},
	log : {
		mute : true, //log nie będzie wyświetlał requestów na serwer, w praktyce chyba tylko dla testów jest to ok
	},
	db : {
			type : 'mysql',
			host : 'localhost',
			name : 'bas_test',
			user : 'root',
			pass : 'root',
			port : '8889',
			logging : false
	},
	adminAuth : {
		login : "admin@bas.pl",
		pass : "aaaaaa6"
	}
};