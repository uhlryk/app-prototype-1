var config = require("../config/local_test.js");
var url = 'http://localhost:' + config.app.port;
var Promise = require("bluebird");
/**
 * Moduł wypełnia kompletnie aplikację określonymi danymi
 * argument:
 * {
 * 	profile:liczba profili,
 * 	admin : liczba adminów na profil,
 * 	initProject: liczba projektów w trybie INIT na profil,
 * 	buildProject: liczba projektów w trybie BUILD na profil,
 * 	serviceProject: liczba projektów w trybie SERVICE na profil,
 * 	investor : liczba userów z rolą INVESTOR na profil,
 * 	coworker :liczba userów z rolą COWORKER na profil,
 * 	inspector : liczba userów z rolą INSPECTOR na profil,
 * 	designer : liczba userów z rolą DESIGNER na profil,
 * 	subcontractor_1: liczba userów z rolą SUBCONTRACTOR z firma A na profil,
 * 	subcontractor_2 : liczba userów z rolą SUBCONTRACTOR z firma B na profil,
 * }
 * return:
 * {
 * 	profileList:[<profileId>]
 * 	profiles:{
 * 		<profileId>:{id:profileId,adminList:[<adminId>], projectList:[<projectId>]}
 * 	},
 * 	projects:{
 * 		<projectId>:{id:projectId, type :<"INIT"|"BUILD"|"SERVICE">, userList:[<accountId>], leaderId:leaderAccountId, profileId:projectProfileId};
 * 	},
 * 	users:{
 * 		<accountId>:{id:accountId, login:userLogin, password:userPassword, profileId:projectProfileId, token : token,
 * 								role :<"PROJECT_LEADER"|"PROFILE_ADMIN"|"COWORKER"|"INVESTOR"|"INSPECTOR"...>, projectId?:projectId(profileAdmin nie ma,
 * 								firmname?:firmname jeśli normal user)};
 * 	},
 * 	roles:{
 * 		PROFILE_ADMIN : [<accountId>],
 * 		PROJECT_LEADER : [<accountId>],
 * 		COWORKER : [<accountId>],
 * 		INVESTOR : [<accountId>],
 * 		INSPECTOR : [<accountId>],
 * 		DESIGNER : [<accountId>],
 * 		SUBCONTRACTOR : [<accountId>],
 * 	},
 * 	modes:{
 * 		INIT:[<projectId>],
 * 		BUILD:[<projectId>],
 * 		SERVICE:[<projectId>],
 * 	}
 * }
 */

module.exports = function(server, url){
	var helper = require("./helper.js")(server, url);
	var result;
	return function(data, cb){
		var profileNumber = data.profile;
		var profileAdminNumber = data.admin;//liczba adminów na profil
		var initProjectNumber = data.initProject;//liczba projektów w trybie INIT
		var buildProjectNumber = data.buildProject;//liczba projektów w trybie INIT
		var serviceProjectNumber = data.serviceProject;//liczba projektów w trybie INIT
		var investorNumber = data.investor;//liczba inwestorów na projekt
		var coworkerNumber = data.coworker;//liczba coworkers na projekt
		var inspectorNumber = data.inspector;//liczba inspectors na projekt
		var designerNumber = data.designer;//liczba designers na projekt
		var subcontractor1Number = data.subcontractor_1;//liczba subcontractor firmy A  na projekt
		var subcontractor2Number = data.subcontractor_2;//liczba subcontractor firmy B  na projekt

		result = {};
		result.profiles = {};
		result.profileList = [];
		result.users = {};
		result.projects = {};
		result.roles = {
			PROFILE_ADMIN : [],
			PROJECT_LEADER : [],
			COWORKER : [],
			INVESTOR:[],
			INSPECTOR:[],
			DESIGNER: [],
			SUBCONTRACTOR:[]
		};
		result.modes = {
			INIT : [],
			BUILD : [],
			SERVICE : []
		};
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
					if(!initProjectNumber)return;
					return Promise.map(new Array(initProjectNumber) , function() {
						countProjects ++;
						return createProjects(countProjects, profileData);
					});
				})
				.then(function(){//tworzymy projekty BUILD dla danego profilu
					var countProjects = initProjectNumber?initProjectNumber:0;
					if(!buildProjectNumber)return;
					return Promise.map(new Array(buildProjectNumber) , function() {
						countProjects ++;
						var projectData;
						return createProjects(countProjects, profileData)
						.then(function(project){
							projectData = project;
							return setProjectBuildMode(project);
						})
						.then(function(){
							return loopUsers(investorNumber, coworkerNumber, inspectorNumber, designerNumber, subcontractor1Number, subcontractor2Number, projectData);
						})
						;
					});
				})
				.then(function(){//tworzymy projekty BUILD dla danego profilu
					var countProjects = initProjectNumber?initProjectNumber:0 + buildProjectNumber?buildProjectNumber:0;
					if(!serviceProjectNumber)return;
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
						})
						.then(function(){
							return loopUsers(investorNumber, coworkerNumber, inspectorNumber, designerNumber, subcontractor1Number, subcontractor2Number, projectData);
						})
						;
					});
				});
			});
		})
		.then(function(){
			// console.log(result);
			cb(result);
		})
		;
	};

	function createProfiles(num){
		return new Promise(function(resolve) {
			helper.createProfile(result.superUserToken, "Firm"+num, function(id){
				result.profiles[id]={id:id,adminList:[], projectList:[]};
				result.profileList.push(id);
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
					profile.adminList.push(id);
					result.roles.PROFILE_ADMIN.push(id);
					resolve();
				});
			});
		});
	}
	function createProjects(num, profile){
		return new Promise(function(resolve) {
			var admin = result.users[profile.adminList[0]];//dla danego profilu pierwszy admin
			helper.createProject(admin.token, profile.id, 'BASIC', "Nazwa"+profile.id+num, "+48" + (802000000+profile.id*1000+num), function(login, projectId, accountId){
				var password = server.getSmsDebug(login).password;
				helper.loginUser(login, password, function(token){
					result.users[accountId]= {id:accountId, login:login, password:password, profileId:profile.id, token : token, role :"PROJECT_LEADER", projectId:projectId};
					profile.projectList.push(projectId);
					result.projects[projectId] = {id:projectId, type :"INIT", userList:[accountId], leaderId:accountId, profileId:profile.id};
					result.roles.PROJECT_LEADER.push(accountId);
					result.modes.INIT.push(projectId);
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
				result.modes.BUILD.push(project.id);
				deleteArrayElement(result.modes.INIT, project.id);
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
					result.roles.COWORKER.push(leader.id);
					deleteArrayElement(result.roles.PROJECT_LEADER, leader.id);
					result.users[accountId]= {id:accountId, login:login, password:password, profileId:leader.profileId, token : token, role :"PROJECT_LEADER", projectId:projectId};
					project.type="SERVICE";
					project.leaderId = accountId;
					project.userList.push(accountId);
					result.roles.PROJECT_LEADER.push(accountId);
					result.modes.SERVICE.push(project.id);
					deleteArrayElement(result.modes.BUILD, project.id);
					resolve();
				});
			});
		});
	}
	function loopUsers(investorNumber, coworkerNumber, inspectorNumber, designerNumber, subcontractor1Number, subcontractor2Number, project){
		var count = 0;
		var subcount =0 ;
		return Promise.map(new Array(6) , function() {
			var role = "COWORKER";
			var firmname = "firmB";
			var num;
			count++;
			switch(count){
				case 1: role="INVESTOR";firmname="firmInvestor";num=investorNumber?investorNumber:0;break;
				case 2: role="COWORKER";firmname="firmCoworker";num=coworkerNumber?coworkerNumber:0;break;
				case 3: role="INSPECTOR";firmname="firmInspector";num=inspectorNumber?inspectorNumber:0;break;
				case 4: role="DESIGNER";firmname="firmDesigner";num=designerNumber?designerNumber:0;break;
				case 5: role="SUBCONTRACTOR";firmname="firmSubA";num=subcontractor1Number?subcontractor1Number:0;break;
				case 6: role="SUBCONTRACTOR";firmname="firmSubB";num=subcontractor2Number?subcontractor2Number:0;break;
			}
			if(!num)return;
			return Promise.map(new Array(num) , function() {
				subcount++;
				return createUser(subcount, role, firmname, project);
			});
		});
	}
	function createUser(num, role, firmname, project){
		return new Promise(function(resolve) {
			var leader = result.users[project.leaderId];
			helper.createUser(leader.token, project.id, role, "+48" + (804000000+project.id*1000+num), firmname, function(login, accountId, roleId){
				var password = server.getSmsDebug(login).password;
				helper.loginUser(login, password, function(token){
					result.users[accountId]= {id:accountId, login:login, password:password, profileId:leader.profileId, token : token, role :role, projectId:project.id, firmname:firmname};
					project.userList.push(accountId);
					result.roles[role].push(accountId);
					resolve();
				});
			});
		});
	}
};
function deleteArrayElement(arr, element){
	var index = arr.indexOf(element);
	if (index > -1) {
		arr.splice(index, 1);
	}
}