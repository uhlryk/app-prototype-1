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
		name : {
			type: DataTypes.STRING(55),
			allowNull: false
		},
		priority: {
			type: DataTypes.INTEGER,
			defaultValue:1
		},
	}, {
		paranoid: true,
		freezeTableName: true,
		classMethods: {
			associate: function (models) {
				MapImage.belongsTo(models.Project);
				MapImage.hasMany(models.Photo);
				MapImage.belongsTo(models.Account);
			}
		}
	});
	return MapImage;
};