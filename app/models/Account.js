/**
 *
 * @param {Sequelize}sequelize
 * @param DataTypes
 * @returns {*|{}|Model|Model<TInstance, TPojo>}
 */
module.exports = function(sequelize, DataTypes) {
	var Account = sequelize.define("Account",{
		/**
		 * inactive jest wtedy gdy ktoś zaproponuje usera, a nie ma jego konta, dopuki nie zostanie zaakceptowany lub dodany to nie ma
		 * wyslanego emaila i konto jakby nie istnieje.
		 * logować można się tylko na kotno ACTIVE
		 */
		status: {
			type: DataTypes.ENUM('PROPOSITION','ACTIVE', 'DISABLE'),
			defaultValue:'ACTIVE',
			allowNull: false
		},
		email: {
			type: DataTypes.STRING(45),
			allowNull: true,
			validate : {
				isEmail : true
			}
		},
		firstname: {
			type: DataTypes.STRING(45),
			allowNull: true
		},
		lastname: {
			type: DataTypes.STRING(45),
			allowNull: true
		},
		password: {
			type: DataTypes.STRING(60),
			allowNull: true,
		},
		phone: {//podstawy identyfikator
			unique: true,
			type: DataTypes.STRING(15),
			allowNull: false
		},
		firmname: {
			type: DataTypes.STRING(45),
			allowNull: false
		},
	}, {
		paranoid: true,
		freezeTableName: true,
		classMethods: {
			associate: function (models) {
				Account.hasMany(models.ProjectAccount);
				// Account.hasMany(models.ProjectAccount, {as:'PropositionAuthor'});
				Account.belongsTo(models.Profile);
				Account.hasMany(models.Photo);
			}
		}
	});
	return Account;
};