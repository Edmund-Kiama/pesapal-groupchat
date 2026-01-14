import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/db.js";
import User from "./user.model.js";
import Election from "./election.model.js";
import Position from "./position.model.js";

class VotingRight extends Model {}

VotingRight.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
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
    positionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Position,
        key: "id",
      },
    },
    has_voted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "VotingRight",
    tableName: "voting_rights",
    timestamps: true,
  }
);

// Associations
User.hasMany(VotingRight, { foreignKey: "userId" });
VotingRight.belongsTo(User, { foreignKey: "userId" });

export default VotingRight;
