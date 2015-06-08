/*jslint node: true */
"use strict";
var chai = require("chai");
chai.use(require('chai-things'));
var expect = chai.expect;
var debug = require('debug')('test');
var request = require('superagent');
module.exports = function(server, url){
	return {
		loginAdmin : function(login, password, cb){
			request.post(url + "/tokens")
			.send({ login: login, password: password, type : "super"})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.token).to.be.a("string");
				cb(res.body.token);
			});
		},
		/**
		 * w trybie testowym możemy pobrać zawartość wysłanych sms
		 * @param  {[type]}   login [description]
		 * @param  {Function} cb    [description]
		 * @return {[type]}         [description]
		 */
		smsDebug : function(adminToken, login, cb){
			request.get(url + "/smsdebug/"+login)
			.set('access-token', adminToken)
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.token).to.be.a("string");
				cb(res.body.token);
			});
		},
		/**
		 * Tworzenie profilu firmy, moze to zrobić tylko superadmin
		 * @param  {[string]}   adminToken superadmintoken
		 * @param  {[string]}   firmname   nazwa firmy, jest to minimalna dana
		 * @param  {Function} cb         [description]
		 * @return {[int]}              zwracamy id profilu firmy
		 */
		createProfile : function(adminToken, firmname, cb){
			request.post(url + "/profiles")
			.set('access-token', adminToken)
			.send({firmname : firmname})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.id).to.be.above(0);
				cb(res.body.id);
			});
		},
		/**
		 * Tworzenie administratora profilu. może go tworzyć inny administrator
		 * @param  {[type]}   adminToken [description]
		 * @param  {[type]}   profileId  [description]
		 * @param  {[type]}   phone      [description]
		 * @param  {Function} cb         [description]
		 * return cb
		 * id Accoun.id
		 * login Account.phone
		 */
		createProfileAdmin : function(adminToken, profileId, phone, cb){
			request.post(url + "/users/profile_admin")
			.set('access-token', adminToken)
			.send({profile_id : profileId})
			.send({phone : phone})
			.send({firmname : "firmaA" + profileId})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.login).to.be.a("string");
				cb(res.body.id, res.body.login);
			});
		},
		/**
		 *
		 * return cb
		 * login Account.phone login leadera
		 * Project.id id projektu
		 * AccountId id leadera
		 */
		createProject : function(profileAdminToken, profileId, packageName, projectName, phone, cb){
			request.post(url + "/projects")
			.set('access-token', profileAdminToken)
			.send({name : projectName})
			.send({package : packageName})
			.send({profile_id : profileId})
			.send({phone : phone})
			.send({firmname : "firmaA"})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.login).to.be.a("string");
				expect(res.body.projectId).to.be.above(0);
				expect(res.body.accountId).to.be.above(0);
				cb(res.body.login, res.body.projectId, res.body.accountId);
			});
		},
		setProjectBuildMode : function(leaderToken, projectId, cb){
			request.post(url + "/projects/mode/build")
			.set('access-token', leaderToken)
			.send({"project_id":projectId})
			.send({"start_date": "2013-03-01"})
			.send({"finish_date": "2013-05-01"})
			.send({"investor_firmname": "inwestor testowy"})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.id).to.be.above(0);
				cb();
			});
		},
		setProjectServiceMode : function(leaderToken, projectId, phone, cb){
			request.post(url + "/projects/mode/service")
			.set('access-token', leaderToken)
			.send({"project_id":projectId})
			.send({"warranty_date": "2015-03-01"})
			.send({"is_new_leader": true})
			.send({phone : phone})
			.send({firmname : "FirmaB"})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.accountId).to.be.above(0);
				expect(res.body.projectId).to.be.equal(projectId);
				cb(res.body.login, res.body.projectId, res.body.accountId);
			});
		},
		createUser : function(leaderToken, projectId, role, phone, firmname, cb){
			request.post(url + "/users/" + role + "/create")
			.set('access-token', leaderToken)
			.send({"project_id": projectId})
			.send({phone : phone})
			.send({firmname : firmname})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.accountId).to.be.above(0);
				expect(res.body.roleId).to.be.above(0);
				expect(res.body.login).to.be.a("string");
				cb(res.body.login, res.body.accountId, res.body.roleId);
			});
		},
		/**
		 * Logowanie normalnego usera (różny od superadmin)
		 * @param  {[string}   login    [description]
		 * @param  {[string]}   password [description]
		 * @param  {Function} cb       callback
		 * @return {string}            token do autoryzacji tego użytkownika
		 */
		loginUser : function(login, password, cb){
			request.post(url + "/tokens")
			.send({ login: login, password: password})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.token).to.be.a("string");
				cb(res.body.token);
			});
		}
	};
};