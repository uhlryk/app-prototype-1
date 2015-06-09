/**
 * Model przechowuje meta dane każdego zdjęcia. Same zdjęcie przechowywane są na dysku lub amazonie
 */
module.exports = function(sequelize, DataTypes) {
	var Photo = sequelize.define("Photo",{
		status: {
			type: DataTypes.ENUM('ACTIVE', 'DELETE'),
			defaultValue:'ACTIVE',
			allowNull: false
		},
		lat: {
			type: DataTypes.DECIMAL(11,7),
			allowNull: true
		},
		lng: {
			type: DataTypes.DECIMAL(11,7),
			allowNull: true
		},
		x_pos: {//pozycja na danej mapie w procentach w osi x od lewej do prawej
			type: DataTypes.DECIMAL(4,2),
			allowNull: true
		},
		y_pos: {//pozycja na danej mapie w procentach w osi y od góry do dołu
			type: DataTypes.DECIMAL(4,2),
			allowNull: true
		},
	}, {
		paranoid: true,
		freezeTableName: true,
		classMethods: {
			associate: function (models) {
				Photo.belongsTo(models.Project);
				Photo.belongsTo(models.Account);
				Photo.belongsTo(models.Category);
				Photo.belongsTo(models.MapImage);
				Photo.hasMany(models.PhotoPermission);
			}
		}
	});
	return Photo;
};