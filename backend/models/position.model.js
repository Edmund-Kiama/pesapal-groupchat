import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/db.js";
import User from "./user.model.js";
import Election from "./election.model.js";

class Position extends Model {}

Position.init(
  {
    position: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        len: [2, 30],
      },
    },
    electionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Election,
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
    modelName: "Position",
    tableName: "positions",
    timestamps: true,
  }
);

export default Position;
