import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from "sequelize";

const errorMiddleware = (err, req, res, next) => {
  try {
    console.error("Error >>", err);

    let statusCode = 500;
    let message = err.message || "Server Error";

    // Sequelize validation errors
    if (err instanceof ValidationError) {
      statusCode = 400;
      message = err.errors.map((e) => e.message).join(", ");
    }

    // Sequelize unique constraint errors
    else if (err instanceof UniqueConstraintError) {
      statusCode = 400;
      message = err.errors.map((e) => e.message).join(", ");
    }

    // Sequelize foreign key constraint errors
    else if (err instanceof ForeignKeyConstraintError) {
      statusCode = 400;
      message = `Invalid reference: ${err.index || ""}`;
    }

    // Not found error (can throw manually in controllers)
    else if (err.statusCode === 404) {
      statusCode = 404;
    }

    res.status(statusCode).json({
      success: false,
      error: message,
    });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
