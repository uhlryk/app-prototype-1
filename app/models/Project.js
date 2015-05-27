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
		mode : {// w jakim jesteśmy trybie, budowy czy serwisu
			type: DataTypes.ENUM('INIT', 'BUILD', 'SERVICE', 'FINISH'),
			defaultValue:'INIT',
			allowNull: false
		},
		name : {
			type : DataTypes.STRING(50),
			allowNull : true,
			validate : {
			}
		},
		start_date : {
			type: DataTypes.DATE
		},
		finish_date : {
			type: DataTypes.DATE
		},
		paid_date: {//oznacza datę do której projekt jest opłacony
			type: DataTypes.DATE,
			allowNull : true,
		},
		investor_firmname : {
			type : DataTypes.STRING(50),
			allowNull : true,
		},
		warranty : {
			type : DataTypes.INTEGER,
			allowNull : true,
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