/**
 * Model przechowuje grafiki map do których user może przypinać zdjęcia
 */
module.exports = function(sequelize, DataTypes) {
	var MapImage = sequelize.define("MapImage",{
		status: {
			type: DataTypes.ENUM('ACTIVE', 'DELETE'),
			defaultValue:'ACTIVE',
			allowNull: false
		},
		priority: {
			type: DataTypes.INTEGER,
		},
	}, {
		paranoid: true,
		freezeTableName: true,
		classMethods: {
			associate: function (models) {
				MapImage.belongsTo(models.Project);
				MapImage.hasMany(models.Photo);
			}
		}
	});
	return MapImage;
};