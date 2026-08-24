const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Teste simples para saber se a API está funcionando
app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensagem: "API Clube das Figurinhas funcionando"
  });
});

// Verifica configuração do PagBank SEM mostrar o token
app.get("/api/status", (req, res) => {
  res.json({
    api: "online",
    pagbank: process.env.PAGBANK_TOKEN ? "configurado" : "token ausente",
    ambiente: process.env.PAGBANK_ENV || "não configurado"
  });
});

// IMPORTANTE PARA
