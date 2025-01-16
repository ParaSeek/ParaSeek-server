import { Server } from "socket.io";

export const initSocketServer = (server) => {
    const io = new Server(server);

    io.on("connection", (socket) => {
        console.log("A user connected");

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        })
    })
}