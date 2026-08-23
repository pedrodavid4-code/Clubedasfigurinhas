import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Clube das Figurinhas API funcionando!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor funcionando na porta ${PORT}`);
});
