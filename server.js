const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Configuração CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL || ["http://localhost:3000", "https://registro-producao.vercel.app"],
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Conexão com MongoDB Atlas
const connectDB = async () => {
    try {
        console.log("🔄 Tentando conectar ao MongoDB Atlas...");
        console.log("URI:", process.env.MONGO_URI); // Para debug - remover em produção
        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout após 5 segundos
            socketTimeoutMS: 45000, // Tempo limite do socket
        });
        
        console.log(`✅ MongoDB Atlas conectado com sucesso!`);
        return conn;
    } catch (err) {
        console.error("❌ Erro ao conectar com MongoDB Atlas:");
        console.error("Mensagem:", err.message);
        if (err.code) console.error("Código do erro:", err.code);
        process.exit(1);
    }
};

// Rotas
app.get("/", (req, res) => {
    res.json({ 
        message: "API de Registro de Produção - Status: Online",
        mongodb_status: mongoose.connection.readyState === 1 ? "Conectado" : "Desconectado",
        environment: process.env.NODE_ENV || 'development'
    });
});

// Importa e usa as rotas de registros
const registrosRouter = require("./routes/registros");
app.use("/api/registros", registrosRouter);

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error("Erro na aplicação:", err);
    res.status(500).json({ 
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Inicialização do servidor
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        const conn = await connectDB();
        
        app.listen(PORT, () => {
            console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
            console.log('📝 Endpoints disponíveis:');
            console.log('   - GET  /api/registros');
            console.log('   - POST /api/registros');
        });
    } catch (err) {
        console.error("❌ Erro ao iniciar o servidor:", err);
        process.exit(1);
    }
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
    console.error('❌ Erro não tratado:', err);
    // Fecha o servidor graciosamente
    server.close(() => process.exit(1));
});

startServer();
