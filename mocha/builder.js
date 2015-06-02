var config = require("../config/local_test.js");
var url = 'http://localhost:' + config.app.port;
module.exports = function(server, url){
	var helper = require("./helper.js")(server, url);
	return function(data, cb){
		var profileNumber = data.profile;
		var profileAdminNumber = data.admin;//liczba adminów na profil
		var initProjectNumber = data.initProjects;//liczba projektów w trybie INIT

		var result = {};
		result.profiles = [];
		result.admins = [];
		result.projects = [];
		var profileId, profileAdminPassword, profileAdminLogin, profileAdminToken,
		secondProfileId,leaderLogin, leaderPassword, projectId, leaderToken;
		helper.loginAdmin(config.adminAuth.login, config.adminAuth.pass, function(token){
				result.superUserToken = token;
				createProfiles(result, 0, profileNumber, function(){
					if(profileNumber > 0 && profileAdminNumber>0){
						createProfileAdmins(result, 0, profileNumber, 0, profileAdminNumber, function(){
							console.log(result);
							cb();
						});
					} else{
						cb();
					}
				});
		});
	};
	function createProfiles(result, act, max, cb){
		helper.createProfile(result.superUserToken, "Firm"+act, function(id){
			var count = act + 1;
			result.profiles.push(id);
			if(count < max){
				createProfiles(result, count, max, cb);
			} else {
				cb();
			}
		});
	}
	function createProfileAdmins(result, actProfile, maxProfile, actAdmin, maxAdmin, cb){
		helper.createProfileAdmin(result.superUserToken, result.profiles[actProfile], "+48" + (801000000 + actProfile*1000 + actAdmin), function(login){
			var countAdmin = actAdmin + 1;
			var countProfile = actProfile;
			var password = server.getSmsDebug(login).password;
			result.admins.push({login:login, password:password, profileId:result.profiles[actProfile]});
			if(countAdmin >= maxAdmin){
				countAdmin = 0;
				countProfile++;
			}
			if(countProfile < maxProfile){
				createProfileAdmins(result, countProfile, maxProfile, countAdmin, maxAdmin, cb);
			} else {
				cb();
			}
		});
	}
	//TODO: tworzenie projektów osobno dla każdego trybu
};