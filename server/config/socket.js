import { Server } from "socket.io";

let io = null;

export function initializeSocket(server) {
    io = new Server(server, {
        cors: { origin: "*" }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("customEvent", (data) => {
            console.log(`Received customEvent:`, data);
            io.emit("serverResponse", `Hello, ${data.name}!`);
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
}

export { io }; // Export io directly
