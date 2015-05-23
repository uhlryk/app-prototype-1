/*jslint node: true */
"use strict";
var chai = require("chai");
chai.use(require('chai-things'));
var expect = chai.expect;
var debug = require('debug')('test');
var request = require('superagent');
module.exports = function(url){
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
				console.log(res.body);
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
		 * @return {[type]}              [description]
		 */
		createProfileAdmin : function(adminToken, profileId, phone, cb){
			request.post(url + "/users/profile_admin")
			.set('access-token', adminToken)
			.send({profile_id : profileId})
			.send({phone : phone})
			.end(function(err, res){
				expect(res.status).to.be.equal(200);
				expect(res.body.login).to.be.a("string");
				cb(res.body.login);
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