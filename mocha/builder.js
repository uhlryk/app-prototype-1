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
				})
				.then(function(){//tworzymy projekty BUILD dla danego profilu
					var countProjects = initProjectNumber;
					return Promise.map(new Array(buildProjectNumber) , function() {
						countProjects ++;
						return createProjects(countProjects, profileData)
						.then(function(project){
							return setProjectBuildMode(project);
						});
					});
				})
				.then(function(){//tworzymy projekty BUILD dla danego profilu
					var countProjects = initProjectNumber + serviceProjectNumber;
					return Promise.map(new Array(serviceProjectNumber) , function() {
						countProjects ++;
						var projectData;
						return createProjects(countProjects, profileData)
						.then(function(project){
							projectData = project;
							return setProjectBuildMode(projectData);
						})
						.then(function(){
							return setProjectServiceMode(projectData);
						});
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
					result.projects[projectId] = {id:projectId, type :"INIT", users:[accountId], leaderId:accountId, profileId:profile.id};
					resolve(result.projects[projectId]);
				});
			});
		});
	}
	function setProjectBuildMode(project){
		return new Promise(function(resolve) {
			var leader = result.users[project.leaderId];
			helper.setProjectBuildMode(leader.token, project.id, function(){
				project.type="BUILD";
				resolve();
			});
		});
	}
	function setProjectServiceMode(project){
		return new Promise(function(resolve) {
			var leader = result.users[project.leaderId];
			helper.setProjectServiceMode(leader.token, project.id, "+48" + (803000000+project.profileId*1000+project.id),function(login, projectId, accountId){
				var password = server.getSmsDebug(login).password;
				helper.loginUser(login, password, function(token){
					leader.role = "COWORKER";
					result.users[accountId]= {id:accountId, login:login, password:password, token : token, role :"PROJECT_LEADER", projectId:projectId};
					project.type="SERVICE";
					project.leaderId = accountId;
					project.users.push(accountId);
					resolve();
				});
			});
		});
	}
};