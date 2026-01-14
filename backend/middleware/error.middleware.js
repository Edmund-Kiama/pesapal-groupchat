const errorMiddleware = (err, req, res, next) => {
  try {
    let error = { ...err };
    console.error("Error >>", error);

    //likely errors to face (Mongoose)
    //--> Bad/Non-existing ObjectId
    if (err.name === "CastError") {
      const message = "Resource not found";
      error = new Error(message);
      error.statusCode = 404;
    }

    // --> Duplicate Key
    if (err.code === 11000) {
      const message = "Duplicate field value entered";
      error = new Error(message);
      error.statusCode = 400;
    }

    // --> Validation Error
    if (err.message === "ValidationError") {
      const message = Object.values(err.errors).map((val) => val.message);
      error = new Error(message.join(", "));
      error.statusCode = 400;
    }

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || "Server Error",
    });
    
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
