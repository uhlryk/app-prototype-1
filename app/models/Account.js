/**
 *
 * @param {Sequelize}sequelize
 * @param DataTypes
 * @returns {*|{}|Model|Model<TInstance, TPojo>}
 */
module.exports = function(sequelize, DataTypes) {
	var Account = sequelize.define("Account",{
		email: {
			type: DataTypes.STRING(45),
			unique: true,
			allowNull: true,
			validate : {
				isEmail : true
			}
		},
		firstname: {
			type: DataTypes.STRING(45),
			allowNull: false
		},
		lastname: {
			type: DataTypes.STRING(45),
			allowNull: false
		},
		phone: {
			type: DataTypes.STRING(15),
			allowNull: false
		}
	}, {
		paranoid: true,
		freezeTableName: true,
		classMethods: {
			associate: function (models) {
				Account.belongsToMany(models.Project, {as : 'accountIdA', through: 'ProjectAccount'});
			}
		}
	});
	return Account;
};