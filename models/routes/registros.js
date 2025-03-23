const express = require("express");
const router = express.Router();
const Registro = require("../models/Registro");

// Criar um novo registro
router.post("/", async (req, res) => {
    try {
        const novoRegistro = new Registro(req.body);
        await novoRegistro.save();
        res.status(201).json(novoRegistro);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Listar todos os registros
router.get("/", async (req, res) => {
    const registros = await Registro.find();
    res.json(registros);
});

module.exports = router;
