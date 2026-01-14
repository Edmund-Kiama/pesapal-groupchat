import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/db.js";
import User from "./user.model.js";
import Position from "./position.model.js";
import Election from "./election.model.js";

class Candidate extends Model {}

Candidate.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: User,
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
    electionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Election,
        key: "id",
      },
    },
    nominated_by: {
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
    modelName: "Candidate",
    tableName: "candidates",
    timestamps: true,
  }
);

// Associations
User.hasOne(Candidate, { foreignKey: "userId" });
Candidate.belongsTo(User, { foreignKey: "userId" });

Position.hasMany(Candidate, { foreignKey: "positionId" });
Candidate.belongsTo(Position, { foreignKey: "positionId" });

Election.hasMany(Candidate, { foreignKey: "electionId" });
Candidate.belongsTo(Election, { foreignKey: "electionId" });

User.hasMany(Candidate, { foreignKey: "nominated_by", as: "Nominations" });
Candidate.belongsTo(User, { foreignKey: "nominated_by", as: "Nominator" });

export default Candidate;
s