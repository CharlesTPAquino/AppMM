const express = require("express");
const router = express.Router();
const Registro = require("../models/Registro");

// GET - Listar todos os registros
router.get("/", async (req, res) => {
    try {
        const registros = await Registro.find().sort({ dataProducao: -1 });
        res.json(registros);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST - Criar novo registro
router.post("/", async (req, res) => {
    const registro = new Registro({
        numeroOP: req.body.numeroOP,
        lote: req.body.lote,
        dataProducao: req.body.dataProducao,
        quantidade: req.body.quantidade,
        anotacoes: req.body.anotacoes
    });

    try {
        const novoRegistro = await registro.save();
        res.status(201).json(novoRegistro);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router; 