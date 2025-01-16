import { Server } from "socket.io";
let io;
export const initSocketServer = (server) => {
    io = new Server(server);

    io.on("connection", (socket) => {
        console.log("A user connected", socket.id);

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        })
    })
}

export {io}