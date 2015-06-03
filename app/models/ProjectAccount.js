module.exports = function(sequelize, DataTypes) {
	var ProjectAccount = sequelize.define("ProjectAccount",{
		status: {
			type: DataTypes.ENUM('PROPOSITION', 'ACTIVE', 'DISABLE'),
			defaultValue:'PROPOSITION',
			allowNull: false
		},
		role: {
			type: DataTypes.ENUM('PROFILE_ADMIN' ,'PROJECT_LEADER', 'COWORKER', 'INVESTOR', 'INSPECTOR', 'DESIGNER', 'SUBCONTRACTOR'),
			allowNull: false
		},
		//głupie ale obecnie oczekiwane rozwiązanie wymusza by imię i nazwisko były określane przez osobę dodającą
		email: {
			type: DataTypes.STRING(45),
			allowNull: true,
			validate : {
				isEmail : true
			}
		},
		firstname: {
			type: DataTypes.STRING(45),
			allowNull: true
		},
		lastname: {
			type: DataTypes.STRING(45),
			allowNull: true
		},
		firmname: {
			type: DataTypes.STRING(45),
			allowNull: false
		},
	}, {
		paranoid: true,
		freezeTableName: true,
		classMethods: {
			associate: function (models) {
				ProjectAccount.belongsTo(models.Account);
				// ProjectAccount.belongsTo(models.Account, {as: 'PropositionAuthor'});
				ProjectAccount.belongsTo(models.Project);
			}
		}
	});
	return ProjectAccount;
};