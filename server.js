const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs"); // Importado para ler as pastas

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// LOG DE SEGURANÇA: Mostra no painel do Render quais arquivos existem no seu projeto
console.log("--- ARQUIVOS ENCONTRADOS NO REPOSITÓRIO ---");
console.log(fs.readdirSync(__dirname));
console.log("-------------------------------------------");

app.use(express.static("."));

// Tenta enviar o arquivo independentemente de onde ele esteja ou como foi escrito
app.get('/', (req, res) => {
    let caminhoArquivo = path.join(__dirname, 'index.html');
    
    // Se não achar em minúsculo, tenta com a primeira maiúscula
    if (!fs.existsSync(caminhoArquivo)) {
        caminhoArquivo = path.join(__dirname, 'Index.html');
    }
    
    if (fs.existsSync(caminhoArquivo)) {
        res.sendFile(caminhoArquivo);
    } else {
        res.status(404).send("<h1>Erro do Servidor: O arquivo 'index.html' nao foi encontrado na raiz do seu GitHub!</h1><p>Verifique o nome das pastas.</p>");
    }
});

let jogadores = {};

io.on("connection", (socket) => {
    console.log("Jogador conectado:", socket.id);

    socket.on("criarSala", (codigo) => {
        socket.join(codigo);
        jogadores[socket.id] = { sala: codigo, x: 100, y: 100 };
        socket.emit("salaCriada", codigo);
    });

    socket.on("entrarSala", (codigo) => {
        socket.join(codigo);
        jogadores[socket.id] = { sala: codigo, x: 200, y: 100 };
        socket.emit("entrou", codigo);
        socket.to(codigo).emit("novoJogador", {
            id: socket.id,
            x: jogadores[socket.id].x,
            y: jogadores[socket.id].y
        });
    });

    socket.on("movimento", (dados)=>{
        if(jogadores[socket.id]){
            jogadores[socket.id].x = dados.x;
            jogadores[socket.id].y = dados.y;
            socket.to(jogadores[socket.id].sala).emit("atualizarJogador", {
                id: socket.id,
                x: dados.x,
                y: dados.y
            });
        }
    });

    socket.on("disconnect",()=>{
        delete jogadores[socket.id];
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT,()=>{
    console.log("Servidor online na porta", PORT);
});
