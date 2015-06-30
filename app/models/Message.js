/**
 *	pojedyńcza wiadomość, od jednej osoby do całej grupy,
 *	wiadomości są powiązane z MessageGroup,
 *	do wiadomości można załączyć wiele MessagePhote z załącznikami zdjęciowymi
 */

module.exports = function(sequelize, DataTypes) {
	var Message = sequelize.define("Message",{
		content:{
			type: DataTypes.STRING(1000),
			defaultValue:'',
		}
	}, {
		paranoid: true,
		freezeTableName: true,
		classMethods: {
			associate: function (models) {
				Message.belongsTo(models.MessageGroup);
				Message.belongsTo(models.Account);//autor
				Message.hasMany(models.MessagePhoto);
			}
		}
	});
	return Message;
};