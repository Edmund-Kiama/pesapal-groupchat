import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/db.js";
import Election from "./election.model.js";
import Candidate from "./candidate.model.js";
import Position from "./position.model.js";

class Vote extends Model {}

Vote.init(
  {
    electionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Election,
        key: "id",
      },
    },
    candidateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Candidate,
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
  },
  {
    sequelize,
    modelName: "Vote",
    tableName: "votes",
    timestamps: true,
  }
);

// Associations
Vote.belongsTo(Election, { foreignKey: "electionId" });
Election.hasMany(Vote, { foreignKey: "electionId" });

Vote.belongsTo(Candidate, { foreignKey: "candidateId" });
Candidate.hasMany(Vote, { foreignKey: "candidateId" });

Vote.belongsTo(Position, { foreignKey: "positionId" });
Position.hasMany(Vote, { foreignKey: "positionId" });

export default Vote;
