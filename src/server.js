import { app } from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
dotenv.config({
  path: "./.env",
});

connectDB().then
app.listen(process.env.PORT, () => {
  console.log(`Server Started port : ${process.env.PORT}`);
});
