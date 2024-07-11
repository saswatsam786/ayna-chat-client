// socket.js (or socket.ts for TypeScript)
import io from "socket.io-client";

const socket = io("http://localhost:2000"); // Replace with your backend server URL and port

socket.on("connect", () => {
  console.log("Connected to socket.io server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from socket.io server");
});

export default socket;
