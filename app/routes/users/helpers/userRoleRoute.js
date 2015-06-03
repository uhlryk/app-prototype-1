var generatePassword = require('password-generator');
module.exports = {
	create : function(req, res, role){
		req.checkBody('project_id', 'INVALID_FIELD').isId();
		req.sanitize('project_id').toInt();
		req.sanitize("phone").normalizePhone();
		req.checkBody('phone', 'REQUIRE_FIELD').notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			return res.sendValidationError({name : "ExpressValidationError", errors :errors});
		}
		req.app.get("actions").projectAccounts.createNormalRole({
			projectId : req.body.project_id,
			firstname : req.body.firstname,
			lastname : req.body.lastname,
			email : req.body.email,
			phone : req.body.phone,
			password : generatePassword(12, true),
			role : role,
			status : 'ACTIVE'
		})
		.then(function(data){
			if(data.operation === 'CREATE_NEW' || data.operation === 'ACTIVE_PROPOSITION'){
				req.app.get('sms').send(data.accountModel.phone, {
					firstname : data.accountModel.firstname,
					lastname : data.accountModel.lastname,
					accountId : data.accountModel.id,
					password : data.password,
					phone : data.accountModel.phone,
				}, function(err, message){
					if(err){
						//todo: zwrócić jakis błąd gdy sms nie wyjdzie
					}
					return res.sendData(200, {login: data.accountModel.phone, id: data.roleModel.id});
				});
			} else {
				return res.sendData(200, {login: data.accountModel.phone, id: data.roleModel.id});
			}
		})
		.catch(function(err){
			return res.sendValidationError(err);
		});
	},
	proposition: function(req, res, role){
		req.checkBody('project_id', 'INVALID_FIELD').isId();
		req.sanitize('project_id').toInt();
		req.sanitize("phone").normalizePhone();
		req.checkBody('phone', 'REQUIRE_FIELD').notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			return res.sendValidationError({name : "ExpressValidationError", errors :errors});
		}
		req.app.get("actions").projectAccounts.createNormalRole({
			projectId : req.body.project_id,
			firstname : req.body.firstname,
			lastname : req.body.lastname,
			email : req.body.email,
			phone : req.body.phone,
			password : generatePassword(12, true),
			role : role,
			status : 'PROPOSITION'
		})
		.then(function(data){
			return res.sendData(200, {login: data.accountModel.phone, id: data.roleModel.id});
		})
		.catch(function(err){
			return res.sendValidationError(err);
		});
	},
	accept :  function(req, res){
		req.checkBody('project_id', 'INVALID_FIELD').isId();
		req.sanitize('project_id').toInt();
		req.checkBody('role_id', 'REQUIRE_FIELD').isId();
		req.sanitize('role_id').toInt();
		var projectAccountId = req.body.id;
		var errors = req.validationErrors();
		if (errors) {
			return res.sendValidationError({name : "ExpressValidationError", errors :errors});
		}
		req.app.get("actions").projectAccounts.activateRole({
			projectAccountId : req.body.role_id,
			projectId : req.body.project_id,
		})
		.then(function(data){
			return res.sendData(200, {});
		})
		.catch(function(err){
			return res.sendValidationError(err);
		});
	}
};