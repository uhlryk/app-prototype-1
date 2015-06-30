/**
 *	gdy rozpoczyna się korespondencja na chacie to najpierw tworzymy tą tabelę, odpowiada ona za
 *	instancję danej konwersjacji,
 *	Mamy dwa typy PRIVATE- rozmowa dwóch osób, jest w trybie ciągłym- nawet jak odezwiemy się po roku
 *	GROUP może być więcej osób, może być wiele konwersjacji, można dodawać nowe osoby
 *	Dana grupa jest zawsze na projekt
 */

module.exports = function(sequelize, DataTypes) {
	var MessageGroup = sequelize.define("MessageGroup",{
		status: {
			type: DataTypes.ENUM('ACTIVE', 'DELETE'),
			defaultValue:'ACTIVE',
			allowNull: false
		},
		type: {
			type: DataTypes.ENUM('PRIVATE', 'GROUP'),
			defaultValue:'PRIVATE',
			allowNull: false
		},
		/**
		 * tylko przy nie prywatnych
		 */
		title :{
			type: DataTypes.STRING(55),
		},
		/**
		 * zastosowanie do prywatnych wątków, w tym wątku ustawiamy projectId_lowerAccountId_upperAccountId np 3_2_4,
		 * będzie to tworzyło unikalny klucz więc grupa się nie zdubluje, i nie powinna, dla typu GROUP zostawiamy to null
		 */
		private_id:{
			type: DataTypes.STRING(35),
			unique: true,
		}
	}, {
		paranoid: true,
		freezeTableName: true,
		classMethods: {
			associate: function (models) {
				MessageGroup.hasMany(models.Message);
				MessageGroup.hasMany(models.MessageGroupAccount);
				MessageGroup.belongsTo(models.Project);
			}
		}
	});
	return MessageGroup;
};