/**
 *	określa jakie konta są częścią danej korespondencji, jeśli osoba ma dostęp do korespondencji to
 *	nie sprawdzamy już czy ma uprawnienia do niej. Sprawdzamy tylko przy tworzeniu i dodawaniu nowych osób
 */

module.exports = function(sequelize, DataTypes) {
	var MessageGroupAccount = sequelize.define("MessageGroupAccount",{
		status: {
			type: DataTypes.ENUM('ACTIVE', 'DELETE'),
			defaultValue:'ACTIVE',
			allowNull: false
		},
	}, {
		paranoid: true,
		freezeTableName: true,
		classMethods: {
			associate: function (models) {
				MessageGroupAccount.belongsTo(models.MessageGroup);
				MessageGroupAccount.belongsTo(models.Account);
			}
		}
	});
	return MessageGroupAccount;
};