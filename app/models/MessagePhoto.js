/**
 *	zawiera powiązane zdjęcia do wiadomości
 */

module.exports = function(sequelize, DataTypes) {
	var MessagePhoto = sequelize.define("MessagePhoto",{
	}, {
		paranoid: true,
		freezeTableName: true,
		classMethods: {
			associate: function (models) {
				MessagePhoto.belongsTo(models.Message);
				MessagePhoto.belongsTo(models.Photo);
			}
		}
	});
	return MessagePhoto;
};