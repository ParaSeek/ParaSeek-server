import { ApiError } from "./ApiError.js";

export const ErrorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";

    // Wrong MongoDB ID error
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ApiError(400,message);
    }

    // Duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ApiError(400,message);
    }

    // Wrong JWT error
    if (err.name === 'JsonWebTokenError') {
        const message = `Json web token is invalid, try again`;
        err = new ApiError(400, message);
    }

    // JWT expired error
    if (err.name === "TokenExpiredError") {
        const message = 'Json web token is expired, try again';
        err = new ApiError(400,message);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};
