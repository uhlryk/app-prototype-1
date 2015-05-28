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