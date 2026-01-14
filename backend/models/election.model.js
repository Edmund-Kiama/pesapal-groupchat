import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/db.js";
import User from "./user.model.js";
import Group from "./group.model.js";

class Election extends Model {}

Election.init(
  {
    date_from: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    date_to: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Group,
        key: "id",
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
    modelName: "Election",
    tableName: "elections",
    timestamps: true,
  }
);

// Associations
Group.hasMany(Election, { foreignKey: "groupId" });
Election.belongsTo(Group, { foreignKey: "groupId" });

User.hasMany(Election, { foreignKey: "created_by", as: "CreatedElections" });
Election.belongsTo(User, { foreignKey: "created_by", as: "Creator" });

export default Election;
