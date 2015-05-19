/**
 *
 * @param {Sequelize}sequelize
 * @param DataTypes
 * @returns {*|{}|Model|Model<TInstance, TPojo>}
 */
module.exports = function(sequelize, DataTypes) {
	var Profile = sequelize.define("Profile",{
		status: {
			type: DataTypes.ENUM('ACTIVE', 'DISABLE', 'DELETE'),
			defaultValue:'ACTIVE',
			allowNull: false
		},
		firmname: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		nip : {
			type: DataTypes.STRING(15),
			validate : {
			}
		},
		street_address: {
			type: DataTypes.STRING(255)
		},
		house_address: {
			type: DataTypes.STRING(10)
		},
		flat_address: {
			type: DataTypes.STRING(10)
		},
		zipcode_address: {
			type: DataTypes.STRING(10),
			allowNull: true,
			validate : {
				is: /^[0-9]{2}-[0-9]{3}$/,
			}
		},
		city_address: {
			type: DataTypes.STRING(45)
		},
	}, {
		paranoid: true,
		freezeTableName: true,
		classMethods: {
			associate: function (models) {
				Profile.hasMany(models.Account);
				Profile.hasMany(models.Project);
			}
		}
	});
	return Profile;
};