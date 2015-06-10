/**
 * Model przechowuje kategorie dla danego projektu. Ogólnie każdy projekt ma kilka takich samych kategorii (dla każdego
 * projektu są to osobne wpisy) plus maksymalnie dwie kategorie customowe.
 */
module.exports = function(sequelize, DataTypes) {
	var Category = sequelize.define("Category",{

		type: {
			type: DataTypes.ENUM(
				'WAY_OF_MAKING',//sposób wykonania (budowa)
				'TO_RECEIVE', //do odbioru (budowa)
				'FAULT_BUILD',  //usterka (budowa )
				'FAULT_SERVICE',  //usterka (serwis)
				'ADVANCEMENT',  //zaawansowanie prac (budowa)
				'BHP_BUILD', //bhp (budowa)
				'BHP_SERVICE', //bhp (serwis)
				'ISUE_BUILD', //problem projektowy (budowa)
				'ISUE_SERVICE', //problem projektowy (serwis)
				'SCAN_BUILD',//skaner pism (budowa)
				'SCAN_SERVICE',//skaner pism (serwis)
				'INNOVATION',//pokaż innowacje (budowa)
				'DELIVERY',//dostawy (budowa)
				'DISORDER',//nieporządek (budowa)
				'CUSTOM_1',//własna kategoria 1 (budowa)
				'CUSTOM_2',//własna kategoria 2 (budowa)
				'REPORT', //zgłoś usunięcie (serwis)
				'REPAIR_FLOW'//przebieg prac (serwis)
			)
		},
		mode :{
			type: DataTypes.ENUM('BUILD', 'SERVICE'),//kategorie są/mogą być różne dla obu trybów
		},
		name: {
			type: DataTypes.STRING(25),
		},
		priority : {
			type: DataTypes.INTEGER
		}
	}, {
		paranoid: true,
		freezeTableName: true,
		classMethods: {
			associate: function (models) {
				Category.belongsTo(models.Project);
				Category.hasMany(models.Photo);
			}
		}
	});
	return Category;
};