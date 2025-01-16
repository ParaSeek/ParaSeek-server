import { app } from "./app.js";
import dotenv from "dotenv";
import http from "http";
import { connectDB } from "./db/connectDB.js";
import { initSocketServer } from "./socketServer.js";
dotenv.config({
  path: "./.env",
});

const server = http.createServer(app);

initSocketServer(server);

connectDB()
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Server started on port: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit the process with an error code
  });
