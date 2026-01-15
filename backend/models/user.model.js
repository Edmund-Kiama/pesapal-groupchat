import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/db.js";

class User extends Model {}

User.init(
  {
    // Name
    name: {
      type: DataTypes.STRING(30), // max 30 chars
      allowNull: false,
      validate: {
        notNull: { msg: "User name is required" },
        len: { args: [2, 30], msg: "Name must be 2-30 characters" },
      },
    },

    // Email
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: "Email is required" },
        isEmail: { msg: "Must be a valid email address" },
      },
    },

    // Password
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Password is required" },
        len: { args: [6], msg: "Password must be at least 6 characters" },
      },
    },

    // Role
    role: {
      type: DataTypes.ENUM("admin", "member"),
      defaultValue: "member",
      allowNull: false,
      validate: {
        isIn: {
          args: [["admin", "member"]],
          msg: "Role must be admin or member",
        },
      },
    },

    // Reset Password Token
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Reset Password Expiry
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  }
);

export default User;
