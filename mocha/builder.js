var config = require("../config/local_test.js");
var url = 'http://localhost:' + config.app.port;
var Promise = require("bluebird");
module.exports = function(server, url){
	var helper = require("./helper.js")(server, url);
	var result;
	return function(data, cb){
		var profileNumber = data.profile;
		var profileAdminNumber = data.admin;//liczba adminów na profil
		var initProjectNumber = data.initProject;//liczba projektów w trybie INIT
		var buildProjectNumber = data.buildProject;//liczba projektów w trybie INIT
		var serviceProjectNumber = data.serviceProject;//liczba projektów w trybie INIT

		result = {};
		result.profiles = {};
		result.users = {};
		result.projects = {};
		var profileId, profileAdminPassword, profileAdminLogin, profileAdminToken,
		secondProfileId,leaderLogin, leaderPassword, projectId, leaderToken;
		new Promise(function(resolve) {
			helper.loginAdmin(config.adminAuth.login, config.adminAuth.pass, function(token){
					result.superUserToken = token;
					resolve();
			});
		})
		.then(function(){
			var countProfiles = 0;
			return Promise.map(new Array(profileNumber) , function() {
				countProfiles ++;
				var profileData;
				return createProfiles(countProfiles)
				.then(function(profile){
					profileData = profile;
				})
				.then(function(){//tworzymy profiles adminów do danego profilu
					var countAdmins = 0;
					return Promise.map(new Array(profileAdminNumber) , function() {
						countProfiles ++;
						return createProfileAdmins(countProfiles, profileData);
					});
				})
				.then(function(){//tworzymy projekty init dla danego profilu
					var countProjects = 0;
					return Promise.map(new Array(initProjectNumber) , function() {
						countProjects ++;
						return createProjects(countProjects, profileData);
					});
				});
			});
		})
		.then(function(){
			console.log(result);
			cb();
		})
		;
	};

	function createProfiles(num){
		return new Promise(function(resolve) {
			helper.createProfile(result.superUserToken, "Firm"+num, function(id){
				result.profiles[id]={id:id,admins:[], projects:[]};
				resolve(result.profiles[id]);
			});
		});
	}
	function createProfileAdmins(num, profile){
		return new Promise(function(resolve) {
			helper.createProfileAdmin(result.superUserToken, profile.id, "+48" + (801000000+profile.id*1000+num), function(id, login){
				var password = server.getSmsDebug(login).password;
				helper.loginUser(login, password, function(token){
					result.users[id]= {id:id, login:login, password:password, profileId:profile.id, token : token, role:"PROFILE_ADMIN"};
					profile.admins.push(id);
					resolve();
				});
			});
		});
	}
	function createProjects(num, profile){
		return new Promise(function(resolve) {
			var admin = result.users[profile.admins[0]];//dla danego profilu pierwszy admin
			helper.createProject(admin.token, profile.id, 'BASIC', "Nazwa"+profile.id+num, "+48" + (802000000+profile.id*1000+num), function(login, projectId, accountId){
				var password = server.getSmsDebug(login).password;
				helper.loginUser(login, password, function(token){
					result.users[accountId]= {id:accountId, login:login, password:password, token : token, role :"PROJECT_LEADER", projectId:projectId};
					profile.projects.push(projectId);
					result.projects[projectId] = {id:projectId, type :"INIT", users:[accountId], leader:accountId};
					resolve();
				});
			});
		});
	}
	// function createProfiles(result, act, max, cb){
	// 	helper.createProfile(result.superUserToken, "Firm"+act, function(id){
	// 		var count = act + 1;
	// 		result.profiles[id]={id:id,admins:[]};
	// 		if(count < max){
	// 			createProfiles(result, count, max, cb);
	// 		} else {
	// 			cb();
	// 		}
	// 	});
	// }
	// function createProfileAdmins(result, actProfile, maxProfile, actAdmin, maxAdmin, cb){
	// 	var profile = result.profiles[actProfile];
	// 	helper.createProfileAdmin(result.superUserToken, profile.id, "+48" + (801000000 + actProfile*1000 + actAdmin), function(login){
	// 		var countAdmin = actAdmin + 1;
	// 		var countProfile = actProfile;
	// 		var password = server.getSmsDebug(login).password;
	// 		helper.loginUser(login, password, function(token){
	// 			result.admins.push({login:login, password:password, profileId:profile.id, token : token});
	// 			result.profiles[actProfile].admins.push(result.admins.length-1);
	// 			if(countAdmin >= maxAdmin){
	// 				countAdmin = 0;
	// 				countProfile++;
	// 			}
	// 			if(countProfile < maxProfile){
	// 				createProfileAdmins(result, countProfile, maxProfile, countAdmin, maxAdmin, cb);
	// 			} else {
	// 				cb();
	// 			}
	// 		});
	// 	});
	// }
	// function createProjects(result, actProfile, maxProfile, actProject, maxProject, cb){
	// 	var profile = result.profiles[actProfile];
	// 	var admin = profile.admins[0];
	// 	helper.createProject(admin.token, profile.id, 'BASIC', "Nazwa" + actProfile + actProject, "+48791990000" + (actProfile * 100) + (actProject), function(login, projectId){
	// 		var countProject = actProject + 1;
	// 		var countProfile = actProfile;
	// 		var password = server.getSmsDebug(login).password;
	// 		helper.loginUser(login, password, function(token){
	// 			result.users.push({login:login, password:password, token : token});
	// 			result.profiles[actProfile].admins.push(result.admins.length-1);
	// 			if(countAdmin >= maxAdmin){
	// 				countAdmin = 0;
	// 				countProfile++;
	// 			}
	// 			if(countProfile < maxProfile){
	// 				createProfileAdmins(result, countProfile, maxProfile, countAdmin, maxAdmin, cb);
	// 			} else {
	// 				cb();
	// 			}
	// 		});
	// 	});
	// }
	//TODO: tworzenie projektów osobno dla każdego trybu
};