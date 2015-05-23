/**
 *
 * @param {Sequelize}sequelize
 * @param DataTypes
 * @returns {*|{}|Model|Model<TInstance, TPojo>}
 */
module.exports = function(sequelize, DataTypes) {
	var ProjectAccount = sequelize.define("ProjectAccount",{
		status: {
			type: DataTypes.ENUM('INACTIVE', 'ACTIVE', 'DISABLE', 'DELETE'),
			defaultValue:'INACTIVE',
			allowNull: false
		},
		role: {
			type: DataTypes.ENUM('PROJECT_LEADER', 'COWORKER', 'INVESTOR', 'INSPECTOR', 'DESIGNER', 'SUBCONTRACTOR'),
			allowNull: false
		},
	}, {
		paranoid: true,
		freezeTableName: true,
		classMethods: {
			associate: function (models) {
				ProjectAccount.belongsTo(models.Account);
				ProjectAccount.belongsTo(models.Project);
			}
		}
	});
	return ProjectAccount;
};