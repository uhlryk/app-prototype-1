/**
 * Model przechowuje uprawnienia do każdego zdjęcia, uprawnienia są wg projektu i ról ale czasem również firmy
 */
module.exports = function(sequelize, DataTypes) {
	var PhotoPermission = sequelize.define("PhotoPermission",{
		role: {
			type: DataTypes.ENUM('PROFILE_ADMIN' ,'PROJECT_LEADER', 'COWORKER', 'INVESTOR', 'INSPECTOR', 'DESIGNER', 'SUBCONTRACTOR'),
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