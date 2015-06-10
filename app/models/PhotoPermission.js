/**
 * Model przechowuje uprawnienia do każdego zdjęcia, uprawnienia są wg projektu i ról ale czasem również firmy
 */
module.exports = function(sequelize, DataTypes) {
	var PhotoPermission = sequelize.define("PhotoPermission",{
		/**
		 * GW jest to rola wspólna dla COWORKER, PROJECT_LEADER i PROFILE_ADMIN
		 * @type {Object}
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
				PhotoPermission.belongsTo(models.Photo);
			}
		}
	});
	return PhotoPermission;
};