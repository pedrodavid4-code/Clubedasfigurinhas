import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensagem: "API Clube das Figurinhas funcionando"
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    api: "online",
    pagbank: process.env.PAGBANK_TOKEN ? "configurado" : "token ausente",
    ambiente: process.env.PAGBANK_ENV || "não configurado"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor Clube das Figurinhas rodando na porta ${PORT}`);
});
