/**
 *
 * @param {Sequelize}sequelize
 * @param DataTypes
 * @returns {*|{}|Model|Model<TInstance, TPojo>}
 */
module.exports = function(sequelize, DataTypes) {
	var Project = sequelize.define("Project",{
		status: {
			type: DataTypes.ENUM('ACTIVE', 'DISABLE'),
			defaultValue:'ACTIVE',
			allowNull: false
		},
		package: {
			type: DataTypes.ENUM('BASIC', 'PROFESSIONAL'),
			defaultValue:'BASIC',
			allowNull: false
		},
		name : {
			type : DataTypes.STRING(50),
			allowNull : true,
			validate : {
			}
		},
		paid_to: {
			type: DataTypes.DATE,
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
				Project.hasMany(models.ProjectAccount);
				Project.belongsTo(models.Profile);
				//Project.hasMany(models.Account, {as: 'child', foreignKey: 'parent_id',  through: 'company_relation'});
			}
		}
	});
	return Project;
};