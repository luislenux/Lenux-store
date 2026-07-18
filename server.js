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

app.use(express.static("."));


let jogadores = {};


io.on("connection", (socket) => {

    console.log("Jogador conectado:", socket.id);


    socket.on("criarSala", (codigo) => {

        socket.join(codigo);

        jogadores[socket.id] = {
            sala: codigo,
            x: 100,
            y: 100
        };

        socket.emit(
            "salaCriada",
            codigo
        );

        console.log(
            "Sala criada:",
            codigo
        );

    });



    socket.on("entrarSala", (codigo) => {

        socket.join(codigo);


        jogadores[socket.id] = {
            sala: codigo,
            x: 200,
            y: 100
        };


        socket.emit(
            "entrou",
            codigo
        );


        socket.to(codigo).emit(
            "novoJogador",
            {
                id: socket.id,
                x: jogadores[socket.id].x,
                y: jogadores[socket.id].y
            }
        );


        console.log(
            socket.id,
            "entrou na sala",
            codigo
        );

    });



    socket.on("movimento", (dados)=>{


        if(jogadores[socket.id]){

            jogadores[socket.id].x = dados.x;
            jogadores[socket.id].y = dados.y;


            socket.to(
                jogadores[socket.id].sala
            )
            .emit(
                "atualizarJogador",
                {
                    id: socket.id,
                    x:dados.x,
                    y:dados.y
                }
            );
        }

    });



    socket.on("disconnect",()=>{

        console.log(
            "Jogador saiu:",
            socket.id
        );

        delete jogadores[socket.id];

    });


});



const PORT = process.env.PORT || 3000;


server.listen(PORT,()=>{

    console.log(
        "Servidor online na porta",
        PORT
    );

});