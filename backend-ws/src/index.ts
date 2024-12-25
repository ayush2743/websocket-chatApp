import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080, host: '0.0.0.0'});

const clients = new Map<WebSocket, string>();

wss.on("connection", function (socket) {
    socket.on("message", (msg) => {
        try {
            const parsedMsg = JSON.parse(msg.toString());
            console.log(parsedMsg);

            if (parsedMsg.type === "join") {
                clients.set(socket, parsedMsg.payload.roomId);
            }

            if (parsedMsg.type === "chat") {
                const roomId = clients.get(socket);
                if (roomId) {
                    clients.forEach((clientRoomId, clientSocket) => {
                        if (clientRoomId === parsedMsg.payload.roomId && clientSocket !== socket) {
                            clientSocket.send(parsedMsg.payload.message);
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Error handling message:", error);
        }
    });

    socket.on("close", () => {
        clients.delete(socket);
    });
});
