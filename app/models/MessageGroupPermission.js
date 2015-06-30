/**
 * Model przechowuje uprawnienia do danej grupy publicznej
 * określa jaka role (i firma w przypadku SUBCONTRACTOR) może widzieć dany wątek
 */
module.exports = function(sequelize, DataTypes) {
	var MessageGroupPermission = sequelize.define("MessageGroupPermission",{
		/**
		 * GW jest to rola wspólna dla COWORKER, PROJECT_LEADER i PROFILE_ADMIN
		 */
		role: {
			type: DataTypes.ENUM('GW', 'INVESTOR', 'INSPECTOR', 'DESIGNER', 'SUBCONTRACTOR'),
			allowNull: false
		},
		firmname: {
			type: DataTypes.STRING(45),
			allowNull: true
		},
	}, {
		paranoid: true,
		freezeTableName: true,
		classMethods: {
			associate: function (models) {
				MessageGroupPermission.belongsTo(models.MessageGroup);
			}
		}
	});
	return MessageGroupPermission;
};