/**
 * Moduł tworzy nową rolę dla użytkownika przy projekcie, wpina się w transakcję.
 * Sprawdza czy dane id ma już role w tym projekcie, jeśli ma to jest blokowany,
 * Wyjątkiem jest gdy jest to PROPOSITION, tych może być dużo
 * Wyjątkiem jest gdy rola została DISABLE
 * Wyjątkiem jest PROFILE_ADMIN, on może być GW
 * Sprawdza czy nowa rola może istnieć
 * Nie może być kolejnej roli PROJECT_LEADER
 * Aby dodać nową rolę PROJECT_LEADER trzeba najpierw odpiąć starą
 * UWAGA
 * nie sprawdzamy na tym poziomie czy tworzący user ma prawo dodać rolę docelowemu userowi do takiego projektu
 * sprawdzamy tylko czy docelowy user może mieć taką rolę
 * data.projectId id projektu dla którego ma być ustawiony leader
 * data.role 'PROFILE_ADMIN', 'PROJECT_LEADER', 'COWORKER', 'INVESTOR', 'INSPECTOR', 'DESIGNER', 'SUBCONTRACTOR'
 * data.status 'ACTIVE','PROPOSITION' czyli czy tworzymy użytkownika czy tylko go proponujemy
 * data.accountId niezbędne pole, do identyfikacji i do utworzenia konta
 */

module.exports = function(data, transaction, models, actions){
	var operation;
	if(data.status === 'PROPOSITION'){//może być dowolna licza propozycji ról w projekcie więc nie sprawdzamy istniejących
		//chociaż może warto je obciąć
		return models.ProjectAccount.create({
			status: data.status,
			role : data.role,
			ProjectId : data.projectId,
			AccountId : data.accountId
		}, {transaction : transaction});
	} else {// tworzenie aktywnych ról wymaga sprawdzenia czy spełnione są wszystkie warunki
		return models.ProjectAccount.findAll({//wszystkie aktywne role w projekcie wyciągamy
			where : {
				status : "ACTIVE",
				ProjectId : data.projectId,
			}
		}, {transaction : transaction})
		.then(function(projectAccountList){
			if(projectAccountList === null){//jest dobrze nie ma żadnych ról

			} else {
				projectAccountList.forEach(function(projectAccount){
					//testy ogólne ról w projekcie
					if(projectAccount.role === 'PROJECT_LEADER' && data.role === 'PROJECT_LEADER'){
						/**
						 * chcemy dodać PROJECT_LEADER do projektu który ma już taką rolę, musimy więc throw error
						 */
						throw {name : "AwProccessError", type:"DUPLICATE_PROJECT_LEADER"};
					}
					//testy ról tego użytkownika w projekcie
					if(data.accountId === projectAccount.AccountId){//dany user ma w projekcie rolę
						/**
						 * Możliwy jest tylko jeden warunek, czyli user ma rolę PROFILE_ADMIN i chce być PROJECT_LEADER, pozostałe się wysypią
						 */
						if(projectAccount.role === 'PROFILE_ADMIN' && data.role === 'PROJECT_LEADER'){//jest ok, dany admin może
						} else {//user ma inną rolę niż PROFILE_ADMIN lub docelowa rola jest inna niż PROJECT_LEADER
							throw {name : "AwProccessError", type:"DUPLICATE_ACCOUNT_ROLE"};
						}
					}
				});
			}
		})
		.then(function(){
			return models.ProjectAccount.create({
				status: data.status,
				role : data.role,
				ProjectId : data.projectId,
				AccountId : data.accountId
			}, {transaction : transaction});
		});
	}
};