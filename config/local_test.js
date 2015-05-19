module.exports = {
	app : {
		env : "development",
		port : 3010,
		name : "BAS API"
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