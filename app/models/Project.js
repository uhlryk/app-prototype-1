/**
 *
 * @param {Sequelize}sequelize
 * @param DataTypes
 * @returns {*|{}|Model|Model<TInstance, TPojo>}
 */
module.exports = function(sequelize, DataTypes) {
	var Project = sequelize.define("Project",{
		status: {
			type: DataTypes.ENUM('active', 'inactive'),
			defaultValue:'active',
			allowNull: false
		},
		name : {
			type : DataTypes.STRING(50),
			allowNull : true,
			validate : {
			}
		},
		paid_to: {type: DataTypes.DATE},
		phone: {
			type: DataTypes.STRING(15),
			allowNull: false
		}
	}, {
		paranoid: true,
		freezeTableName: true,
		classMethods: {
			associate: function (models) {
				Project.belongsToMany(models.Account, {as : 'projectIdA', through: 'ProjectAccount'});
				//Project.hasMany(models.Account, {as: 'child', foreignKey: 'parent_id',  through: 'company_relation'});
			}
		}
	});
	return Project;
};