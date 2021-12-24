const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql');
const { Model } = require('sequelize');
module.exports = () => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
    		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true
		},
		admin_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		role_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
        role:{
            type:DataTypes.STRING,
            allowNull: false,

        },
		username:{
            type:DataTypes.STRING,
            allowNull: false,

        },
        password:{
            type:DataTypes.STRING,
            allowNull: false,

        },
		first_name:{
            type:DataTypes.STRING,
            allowNull: false,

        },
		middle_name:{
            type:DataTypes.STRING,
            allowNull: true,

        },
		last_name:{
            type:DataTypes.STRING,
            allowNull: false,

        },
		father_name:{
            type:DataTypes.STRING,
            allowNull: false,

        },
		husband_name:{
            type:DataTypes.STRING,
            allowNull: false,

        },
		gender:{
            type:DataTypes.STRING,
            allowNull: false,

        },
		cnic:{
            type:DataTypes.STRING,
            allowNull: false,

        },
		address:{
            type:DataTypes.STRING,
            allowNull: false,

        },
		city:{
            type:DataTypes.STRING,
            allowNull: false,

        },
		email:{
            type:DataTypes.STRING,
            allowNull: false,

        },
		mobile_no:{
            type:DataTypes.STRING,
            allowNull: false,

        },
		land_line_no:{
            type:DataTypes.STRING,
            allowNull: false,

        },
		user_signs:{
            type:DataTypes.BLOB,
            allowNull: true,

        },
		status:{
            type:DataTypes.INTEGER,
            allowNull: false,

        },
		comments:{
            type:DataTypes.STRING,
            allowNull: false,

        },
		last_login:{
            type:DataTypes.DATE,
            allowNull: false,

        },
        access_token: {
			type: DataTypes.STRING,
			allowNull: true
		},
		access_token_expiry: {
			type: DataTypes.DATE,
			allowNull:true
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull:true
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull:true
		}
    },
    {
      // options
      sequelize,
      modelName: 'User',
      tableName: 'users',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscore: true,
    },
  );
  return User;
};
