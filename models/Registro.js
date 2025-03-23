const mongoose = require("mongoose");

const RegistroSchema = new mongoose.Schema({
    numeroOP: String,
    lote: String,
    dataProducao: Date,
    quantidade: Number,
    anotacoes: String
});

module.exports = mongoose.model("Registro", RegistroSchema);
