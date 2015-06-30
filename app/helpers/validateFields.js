function validateSingle(req, field){
	switch(field){
		case 'phone':
			req.sanitize("phone").normalizePhone();
			req.checkBody('phone', 'REQUIRE_FIELD').notEmpty();
		break;
		case 'firmname':
			req.checkBody('firmname', 'REQUIRE_FIELD').notEmpty();
		break;
		case 'profile_id':
			req.checkBody('profile_id', 'INVALID_FIELD').isId();
			req.sanitize('profile_id').toInt();
		break;
		case 'project_id':
			req.checkBody('project_id', 'INVALID_FIELD').isId();
			req.sanitize('project_id').toInt();
		break;
		case 'account_id':
			req.checkBody('account_id', 'INVALID_FIELD').isId();
			req.sanitize('account_id').toInt();
		break;
		case 'category':
			req.checkBody('category', 'REQUIRE_FIELD').notEmpty();
		break;
		case 'project_id':
			req.checkBody('project_id', 'INVALID_FIELD').isId();
			req.sanitize('project_id').toInt();
		break;
		case 'start_date':
			req.checkBody('start_date', 'INVALID_FIELD').isDate();
			req.sanitize('start_date').toDate();
		break;
		case 'finish_date':
			req.checkBody('finish_date', 'INVALID_FIELD').isDate();
			req.sanitize('finish_date').toDate();
			req.checkBody('finish_date', 'REQUIRE_DATE_GREATER').isDateGreaterThen(req.body.start_date);
		break;
		case 'paid_date':
			req.checkBody('paid_date', 'INVALID_FIELD').isDate();
			req.sanitize('paid_date').toDate();
		break;
		case 'warranty_date':
			req.checkBody('warranty_date', 'INVALID_FIELD').isDate();
			req.sanitize('warranty_date').toDate();
		break;
		case 'investor_firmname':
			req.sanitize('investor_firmname').escape();
		break;
		case 'status':
			req.checkBody('status', 'REQUIRE_FIELD').notEmpty();
		break;
		case 'role_id':
			req.checkBody('role_id', 'REQUIRE_FIELD').isId();
			req.sanitize('role_id').toInt();
		break;
	}
}
function validate(req, res){
	return function(fields){
		if(fields && fields.forEach){
			fields.forEach(function(field){
				validateSingle(req, field);
			});
		}
		var errors = req.validationErrors();
		if (errors) {
			res.sendValidationError({name : "ExpressValidationError", errors :errors});
			return false;
		}
		return true;
	};
}
module.exports = function (){
	return function(req, res, next){
		req.validate = validate(req, res);
		next();
	};
};