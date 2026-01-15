import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/db.js";
import User from "./user.model.js";

class Group extends Model {}

Group.init(
  {
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        len: [2, 30],
      },
    },
    description: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [2, 50],
      },
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Group",
    tableName: "groups",
    timestamps: true, // adds createdAt and updatedAt
  }
);

export default Group;
