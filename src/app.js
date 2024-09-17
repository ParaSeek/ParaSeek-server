import express from 'express';
import { ErrorMiddleware } from './utils/error.js';

const app = express();



// unknown route 
app.all("*", (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
});

app.use(ErrorMiddleware);
export {
    app
};
