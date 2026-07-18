const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const jogadores = {};

app.use(express.static("./"));

io.on("connection", (socket) => {

    console.log("Jogador conectado:", socket.id);

    jogadores[socket.id] = {
        x: 100,
        y: 100
    };

    io.emit("jogadores", jogadores);

    socket.on("movimento", (dados) => {

        jogadores[socket.id] = dados;

        io.emit("jogadores", jogadores);
    });

    socket.on("disconnect", () => {

        delete jogadores[socket.id];

        io.emit("jogadores", jogadores);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});