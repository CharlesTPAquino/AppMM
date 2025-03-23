const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Configuração CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL || ["http://localhost:3000", "https://registro-producao.vercel.app"],
    optionsSuccessStatus: 200,
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Conexão com MongoDB Atlas
const connectDB = async () => {
    try {
        console.log("🔄 Tentando conectar ao MongoDB Atlas...");
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        
        if (!mongoUri) {
            throw new Error("URI do MongoDB não encontrada nas variáveis de ambiente!");
        }
        
        console.log("URI:", mongoUri);
        
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
            retryWrites: true,
            w: "majority"
        });
        
        console.log(`✅ MongoDB Atlas conectado com sucesso!`);
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log(`🌐 Host: ${conn.connection.host}`);
        
        // Evento de erro na conexão
        mongoose.connection.on('error', (err) => {
            console.error('❌ Erro na conexão MongoDB:', err);
        });

        // Evento de desconexão
        mongoose.connection.on('disconnected', () => {
            console.log('🔌 Desconectado do MongoDB');
        });

        // Evento de reconexão
        mongoose.connection.on('reconnected', () => {
            console.log('🔄 Reconectado ao MongoDB');
        });
        
        return conn;
    } catch (err) {
        console.error("❌ Erro ao conectar com MongoDB Atlas:");
        console.error("URI:", mongoUri ? mongoUri.replace(/:[^:/@]+@/, ':****@') : 'undefined');
        console.error("Mensagem:", err.message);
        if (err.code) console.error("Código do erro:", err.code);
        throw err;
    }
};

// Rotas
app.get("/", (req, res) => {
    res.json({ 
        message: "API de Registro de Produção - Status: Online",
        mongodb_status: mongoose.connection.readyState === 1 ? "Conectado" : "Desconectado",
        environment: process.env.NODE_ENV || 'development',
        version: "1.0.0"
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
        error: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
    });
});

// Inicialização do servidor
const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
    try {
        await connectDB();
        
        server = app.listen(PORT, () => {
            console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
            console.log('📝 Endpoints disponíveis:');
            console.log('   - GET  /api/registros');
            console.log('   - POST /api/registros');
        });

        // Tratamento gracioso de desligamento
        process.on('SIGTERM', () => {
            console.log('Recebido SIGTERM. Iniciando desligamento gracioso...');
            shutdown();
        });

        process.on('SIGINT', () => {
            console.log('Recebido SIGINT. Iniciando desligamento gracioso...');
            shutdown();
        });

    } catch (err) {
        console.error("❌ Erro ao iniciar o servidor:", err);
        process.exit(1);
    }
};

// Função de desligamento gracioso
const shutdown = async () => {
    console.log('Iniciando desligamento do servidor...');
    
    try {
        if (server) {
            await new Promise((resolve) => {
                server.close(() => {
                    console.log('Servidor HTTP fechado.');
                    resolve();
                });
            });
        }
        
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log('Conexão MongoDB fechada.');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Erro durante o desligamento:', err);
        process.exit(1);
    }
    
    // Força o encerramento após 10 segundos
    setTimeout(() => {
        console.error('Não foi possível encerrar graciosamente, forçando encerramento');
        process.exit(1);
    }, 10000);
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
    console.error('❌ Erro não tratado:', err);
    shutdown();
});

startServer();
