import express from 'express';
import { ErrorMiddleware } from './utils/error.js';
import { authRouter } from './routes/auth.route.js';
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors())

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// auth route
app.use('/api/v1/auth',authRouter);
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