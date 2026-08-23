import express from "express";

const app = express();

app.use(express.json());

// Permite que o Clube das Figurinhas converse com a API
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://www.clubedasfigurinhas.com.br"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Página inicial para verificar se a API está funcionando
app.get("/", (req, res) => {
  res.send("Clube das Figurinhas API funcionando!");
});

// ======================================================
// CRIAR CHECKOUT PAGBANK
// ======================================================

app.post("/criar-checkout", async (req, res) => {
  try {
    const token = process.env.PAGBANK_TOKEN;

    if (!token) {
      return res.status(500).json({
        erro: "Token do PagBank não configurado."
      });
    }

    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        erro: "Carrinho vazio."
      });
    }

    const itensPagBank = items.map((item, index) => ({
      reference_id: String(
        item.id || `ITEM-${index + 1}`
      ),

      name: String(
        item.nome || item.name || "Figurinha"
      ).slice(0, 100),

      quantity: Math.max(
        1,
        Number(item.quantidade || item.quantity || 1)
      ),

      unit_amount: Math.round(
        Number(
          item.preco ||
          item.price ||
          item.unit_amount ||
          0
        ) * 100
      )
    }));

    const pedido = {
      reference_id: `CLUBE-${Date.now()}`,

      items: itensPagBank,

      redirect_url:
        "https://www.clubedasfigurinhas.com.br/",

      return_url:
        "https://www.clubedasfigurinhas.com.br/",

      notification_urls: [
        "https://clubedasfigurinhas-api.onrender.com/web
