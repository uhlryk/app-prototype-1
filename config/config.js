module.exports = {
	app : {
		env : "development",
		port : 3001,
		name : "BAS API"
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