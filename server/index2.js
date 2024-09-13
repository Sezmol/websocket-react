const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8081 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log("received: %s", message);
    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  setInterval(() => {
    ws.send("Welcome to the WebSocket localhost:8081!");
  }, 5000);
});

console.log("WebSocket server is running on ws://localhost:8081");
