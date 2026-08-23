
import express from "express";

const app = express();

app.use(express.json());

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

app.get("/", (req, res) => {
  res.send("Clube das Figurinhas API funcionando!");
});

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
      reference_id: String(item.id || `ITEM-${index + 1}`),
      name: String(item.nome || item.name || "Figurinha").slice(0, 100),
      quantity: Math.max(
        1,
        Number(item.quantidade || item.quantity || 1)
      ),
      unit_amount: Math.round(
        Number(item.preco || item.price || 0) * 100
      )
    }));

    const pedido = {
      reference_id: `CLUBE-${Date.now()}`,
      items: itensPagBank,
      redirect_url: "https://www.clubedasfigurinhas.com.br/",
      return_url: "https://www.clubedasfigurinhas.com.br/",
      notification_urls: [
        "https://clubedasfigurinhas-api.onrender.com/webhook"
      ],
      payment_notification_urls: [
        "https://clubedasfigurinhas-api.onrender.com/webhook"
      ]
    };

    const resposta = await fetch(
      "https://sandbox.api.pagseguro.com/checkouts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(pedido)
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      return res.status(resposta.status).json({
        erro: "Não foi possível criar o checkout.",
        detalhes: dados
      });
    }

    const linkPagamento = dados.links?.find(
      (link) => link.rel === "PAY"
    );

    return res.json({
      checkout_id: dados.id,
      pagamento_url: linkPagamento?.href || null
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: "Erro interno ao criar checkout."
    });
  }
});

app.post("/webhook", (req, res) => {
  console.log("Notificação PagBank:", req.body);
  return res.sendStatus(200);
});

app.get("/teste-checkout", async (req, res) => {
  try {
    const token = process.env.PAGBANK_TOKEN;

    if (!token) {
      return res.status(500).json({
        erro: "Token do PagBank não configurado no Render."
      });
    }

    const resposta = await fetch(
      "https://sandbox.api.pagseguro.com/checkouts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reference_id: `TESTE-${Date.now()}`,
          items: [
            {
              reference_id: "TESTE-1",
              name: "Figurinha teste",
              quantity: 1,
              unit_amount: 100
            }
          ],
          redirect_url: "https://www.clubedasfigurinhas.com.br/",
          return_url: "https://www.clubedasfigurinhas.com.br/"
        })
      }
    );

    const dados = await resposta.json();

    return res.status(resposta.status).json(dados);

  } catch (erro) {
    return res.status(500).json({
      erro: erro.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Clube das Figurinhas API funcionando na porta ${PORT}`
  );
});
