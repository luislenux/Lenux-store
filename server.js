const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.use(express.static("."));

io.on("connection", (socket) => {

    console.log("Jogador conectado:", socket.id);

    socket.on("criarSala", (codigo) => {
        socket.join(codigo);
    });

    socket.on("entrarSala", (codigo) => {
        socket.join(codigo);
    });

    socket.on("disconnect", () => {
        console.log("Jogador saiu");
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Servidor rodando!");
});