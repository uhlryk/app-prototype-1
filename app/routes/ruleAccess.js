/*jslint node: true */
"use strict";
/**
 * userData structure:
 * {
 * 	data - obiekt z dowolnymi danymi zapisywanymi w 'sesji'
 * 	type - jeśli 'SUPER' to mamy doczynienia z super adminem. Pozostali mają 'USER'
 * 	AccountId - id konta usera, superadmin ma null
 * 	Account : { szczegóły konta użytkownika, super admin ma null, są tylko aktywne konta brane
 * 		id - to samo co AccountId
 * 		phone - login usera
 * 		ProfileId - id profilu, tą wartość ma tylko administrator profilu - jedno powiązanie maksymalnie
 * 		ProjectAccounts : {[ - lista ról we wszystkich projektach, może być [] przy braku ról, są tylko aktywne role brane
 * 			role - rola usera w projekcie
 *    	firmname - jaka firma jest usera w tej roli, niektóre uprawnienia tego wymagają
 * 			ProjectId - id projektu
 * 			Project { - szczegóły projektu, wszystkie projekty brane
 * 				status - ACTIVE | DISABLE
 * 				package - jaki pakiet 'BASIC' | 'PROFESSIONAL'
 * 				mode - w jakim trybie jest projekt 'INIT' | 'BUILD' | 'SERVICE' | 'FINISH'
 * 				start_date - data rozpoczęcia projektu
 * 				finish_date - data zakończenia fazy budowy
 * 				warranty_date - data końca serwisowania
 * 				paid_date - data do której jest opłacony projekt
 * 				ProfileId - id profilu do którego należy ten projekt
 * 				Profile { szczegóły profilu do którego należy konto, brane są wszystkie profile
 * 					status - ACTIVE | DISABLE
 * 				}
 * 			}
 * 		]}
 * 	}
 * }
 */
var RuleAccess = require('ruleaccess');

/**
 * Przepuszcza tylko superadmina
 */
function superAdminAllowed(){
	return function(userData, params){
		return (userData && userData.type === 'SUPER');
	};
}
/**
 * Owner musi być adminem profilu który jest podany jako params.body.profile_id lub jeśli
 * jest to sprawdzenie w route callback to req.body.profile_id
 */
function profileAdminAllowed(){
	return function(userData, params){
		var profileId = Number(params.body.profile_id);
		if(userData && userData.Account && userData.Account.ProfileId){
			return (profileId === userData.Account.ProfileId);
		}
		return false;
	};
}
/**
 * Owner musi być pełnić określoną rolę w danym projekcie, projekt musi być aktywny
 * id prodijeku = params.body.project_id lub jeśli
 * jest to sprawdzenie w route callback to req.body.project_id
 * user role określamy w opcjach
 */
function projectRoleAllowed(role){
	return function(userData, params){
		var projectId = Number(params.body.project_id);
		if(userData && userData.Account && userData.Account.ProjectAccounts && userData.Account.ProjectAccounts.some){
			return userData.Account.ProjectAccounts.some(function(roleData){
				if(roleData.Project && roleData.Project.status === 'ACTIVE' && roleData.role === role && projectId > 0 && roleData.ProjectId === projectId){
					return true;
				}
				return false;
			});
		}
		return false;
	};
}
/**
 * uprawnienie jest wtedy gdy w danym projekcie autor ma rolę
 * która ma przypisaną tą samą firmę jaka jest wysyłana w rządaniu
 */
function roleFirmnameAllowed(role){
	return function(userData, params){
		var projectId = Number(params.body.project_id);
		var firmname = params.body.firmname;
		if(userData && userData.Account && userData.Account.ProjectAccounts && userData.Account.ProjectAccounts.some){
			return userData.Account.ProjectAccounts.some(function(roleData){
				if(roleData.Project && roleData.Project.status === 'ACTIVE' && roleData.role === role && projectId > 0 && roleData.ProjectId === projectId && roleData.firmname === firmname){
					return true;
				}
				return false;
			});
		}
		return false;
	};
}
/**
 * uprawnienie jest wtedy gdy user ma jakąkolwiek rolę w danym projekcie
 * @return {[type]} [description]
 */
function projectAnyRoleAllowed(){
	return function(userData, params){
		var projectId = Number(params.body.project_id);
		if(userData && userData.Account && userData.Account.ProjectAccounts && userData.Account.ProjectAccounts.some){
			return userData.Account.ProjectAccounts.some(function(roleData){
				if(roleData.Project && roleData.Project.status === 'ACTIVE' && projectId > 0 && roleData.ProjectId === Number(projectId)){
					return true;
				}
				return false;
			});
		}
		return false;
	};
}
module.exports = function(ruleAccess) {
	/**
	 * tylko super admin ma dostęp do zasobu
	 */
	ruleAccess.addRule("POST/profiles/", superAdminAllowed());
	/**
	 * tylko profileadmin profilu w danym profilu lub super admin
	 */
	ruleAccess.addRule("POST/users/profile_admin/", RuleAccess.rule.anyOnRuleList([profileAdminAllowed(), superAdminAllowed()]));
	/**
	 * tylko profileadmin profilu w danym profilu
	 */
	ruleAccess.addRule("POST/projects/", profileAdminAllowed());
	/**
	 * tylko leader tego projektu
	 */
	ruleAccess.addRule("POST/projects/mode/build/", projectRoleAllowed('PROJECT_LEADER'));
	/**
	 * tylko leader tego projektu
	 */
	ruleAccess.addRule("POST/projects/mode/service/", projectRoleAllowed('PROJECT_LEADER'));
	// ruleAccess.addRule("POST/projects/mode/service", RuleAccess.rule.alwaysAllow());
	/**
	 * tylko super admin ma dostęp do zasobu
	 */
	ruleAccess.addRule("POST/projects/status/", superAdminAllowed());
	/**
	 * tylko super admin ma dostęp do zasobu
	 */
	ruleAccess.addRule("POST/projects/paymant/", superAdminAllowed());
	/**
	 * reguły dodawania użytkowników, ACTIVE, PROPOSITION i ACTIVATE PROPOSITION
	 */
	ruleAccess.addRule("POST/users/coworker/create/", projectRoleAllowed('PROJECT_LEADER'));
	ruleAccess.addRule("POST/users/coworker/accept/", projectRoleAllowed('PROJECT_LEADER'));
	ruleAccess.addRule("POST/users/coworker/proposition/", RuleAccess.rule.anyOnRuleList([
		projectRoleAllowed('PROFILE_ADMIN'),
		projectRoleAllowed('COWORKER')
	]));

	ruleAccess.addRule("POST/users/investor/create/", projectRoleAllowed('PROJECT_LEADER'));
	ruleAccess.addRule("POST/users/investor/accept/", projectRoleAllowed('PROJECT_LEADER'));
	ruleAccess.addRule("POST/users/investor/proposition/", RuleAccess.rule.anyOnRuleList([
		projectRoleAllowed('PROFILE_ADMIN'),
		projectRoleAllowed('COWORKER'),
		projectRoleAllowed('INVESTOR'),
	]));

	ruleAccess.addRule("POST/users/designer/create/", projectRoleAllowed('PROJECT_LEADER'));
	ruleAccess.addRule("POST/users/designer/accept/", projectRoleAllowed('PROJECT_LEADER'));
	ruleAccess.addRule("POST/users/designer/proposition/", RuleAccess.rule.anyOnRuleList([
		projectRoleAllowed('PROFILE_ADMIN'),
		projectRoleAllowed('COWORKER'),
		projectRoleAllowed('INVESTOR'),
		projectRoleAllowed('INSPECTOR'),
		projectRoleAllowed('DESIGNER'),
	]));

	ruleAccess.addRule("POST/users/inspector/create/", projectRoleAllowed('PROJECT_LEADER'));
	ruleAccess.addRule("POST/users/inspector/accept/", projectRoleAllowed('PROJECT_LEADER'));
	ruleAccess.addRule("POST/users/inspector/proposition/", RuleAccess.rule.anyOnRuleList([
		projectRoleAllowed('PROFILE_ADMIN'),
		projectRoleAllowed('COWORKER'),
		projectRoleAllowed('INVESTOR'),
		projectRoleAllowed('INSPECTOR'),
	]));

	ruleAccess.addRule("POST/users/subcontractor/create/", RuleAccess.rule.anyOnRuleList([
		projectRoleAllowed('PROJECT_LEADER'),
		projectRoleAllowed('COWORKER'),
		projectRoleAllowed('PROFILE_ADMIN')
	]));
	ruleAccess.addRule("POST/users/subcontractor/accept/", RuleAccess.rule.anyOnRuleList([
		projectRoleAllowed('PROJECT_LEADER'),
		projectRoleAllowed('COWORKER'),
		projectRoleAllowed('PROFILE_ADMIN')
	]));
	ruleAccess.addRule("POST/users/subcontractor/proposition/", RuleAccess.rule.anyOnRuleList([
		projectRoleAllowed('PROFILE_ADMIN'),
		projectRoleAllowed('COWORKER'),
		projectRoleAllowed('INVESTOR'),
		roleFirmnameAllowed('SUBCONTRACTOR'),
	]));

	ruleAccess.addRule("POST/photos/", RuleAccess.rule.anyOnRuleList([
		projectAnyRoleAllowed()
	]));
	ruleAccess.addRule("POST/maps/", RuleAccess.rule.anyOnRuleList([
		projectRoleAllowed('PROJECT_LEADER'),
		projectRoleAllowed('COWORKER'),
		projectRoleAllowed('PROFILE_ADMIN')
	]));

	ruleAccess.addRule("POST/messages/private", RuleAccess.rule.everyOnRuleList([
		projectAnyRoleAllowed()
	]));

	ruleAccess.addRule("POST/messages/public", RuleAccess.rule.everyOnRuleList([
		projectAnyRoleAllowed()
	]));
};