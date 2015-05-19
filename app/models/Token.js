/**
 *
 * @param {Sequelize}sequelize
 * @param DataTypes
 * @returns {*|{}|Model|Model<TInstance, TPojo>}
 */
module.exports = function(sequelize, DataTypes) {
	var Token = sequelize.define("Token",{
		/**
		 * przechowuje sesję użytkownika
		 */
		token: {
			type: DataTypes.STRING(100),
			allowNull: false
		},
		data: {
			type: DataTypes.STRING(45),
		},
		type: {
			type: DataTypes.ENUM('SUPER', 'USER'),
			defaultValue:'USER',
		},
		status: {
			type: DataTypes.ENUM('ACTIVE', 'DISABLE'),
			defaultValue:'ACTIVE',
			allowNull: false
		},
	}, {
		paranoid: true,
		freezeTableName: true,
		classMethods: {
			associate: function (models) {
				Token.belongsTo(models.Account);
			}
		}
	});
	return Token;
};