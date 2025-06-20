require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/users");
const docRoutes = require("./routes/docs");
const testRoutes = require("./routes/test");

app.use("/api/users", userRoutes);
app.use("/api/documents", docRoutes);
app.use("/api/test", testRoutes);

const handleDOcumentSocket = require("./sockets/documentSocket");
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
    handleDOcumentSocket(socket, io);
    socket.on("disconnect", () => {
        console.log(`User Disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is Running on ${PORT}`);
});
