import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();

const dataFile = process.env.JSON_DB_PATH || path.resolve(process.cwd(), 'data.json');

function readData() {
  if (!fs.existsSync(dataFile)) {
    const initial = { produtos: [], carrinho_itens: [] };
    fs.writeFileSync(dataFile, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(dataFile, 'utf-8') || '{}';
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.produtos) parsed.produtos = [];
    if (!parsed.carrinho_itens) parsed.carrinho_itens = [];
    return parsed;
  } catch {
    const fallback = { produtos: [], carrinho_itens: [] };
    fs.writeFileSync(dataFile, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

function writeData(d) {
  fs.writeFileSync(dataFile, JSON.stringify(d, null, 2));
}

function nextId(list) {
  const max = list.reduce((m, i) => (i.id && i.id > m ? i.id : m), 0);
  return max + 1;
}

app.use(cors());
app.use(express.json());

app.get('/produtos', (req, res) => {
  try {
    const d = readData();
    res.json(d.produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos: ' + error.message });
  }
});

app.get('/produtos/:id', (req, res) => {
  try {
    const d = readData();
    const id = parseInt(req.params.id);
    const produto = d.produtos.find(p => p.id === id);
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(produto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produto: ' + error.message });
  }
});

app.post('/produtos', (req, res) => {
  try {
    const d = readData();
    const { nome, preco, preco_anterior, imagem_url } = req.body;
    if (!nome || !preco) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }
    const novo = {
      id: nextId(d.produtos),
      nome,
      preco: parseFloat(preco),
      preco_anterior: preco_anterior ? parseFloat(preco_anterior) : null,
      imagem_url: imagem_url || ''
    };
    d.produtos.push(novo);
    writeData(d);
    res.status(201).json({ id: novo.id, message: 'Produto adicionado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar produto: ' + error.message });
  }
});

app.put('/produtos/:id', (req, res) => {
  try {
    const d = readData();
    const id = parseInt(req.params.id);
    const { nome, preco, preco_anterior, imagem_url } = req.body;
    if (!nome || !preco) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }
    const idx = d.produtos.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    const atual = d.produtos[idx];
    d.produtos[idx] = {
      ...atual,
      nome,
      preco: parseFloat(preco),
      preco_anterior: preco_anterior ? parseFloat(preco_anterior) : null,
      imagem_url: imagem_url || atual.imagem_url || ''
    };
    writeData(d);
    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar produto: ' + error.message });
  }
});

app.delete('/produtos/:id', (req, res) => {
  try {
    const d = readData();
    const id = parseInt(req.params.id);
    const idx = d.produtos.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    d.produtos.splice(idx, 1);
    d.carrinho_itens = d.carrinho_itens.filter(ci => ci.produto_id !== id);
    writeData(d);
    res.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir produto: ' + error.message });
  }
});

app.get('/carrinho', (req, res) => {
  try {
    const d = readData();
    const itens = d.carrinho_itens.map(ci => {
      const p = d.produtos.find(px => px.id === ci.produto_id) || {};
      return {
        id: ci.id,
        quantidade: ci.quantidade,
        produto_id: ci.produto_id,
        nome: p.nome,
        preco: p.preco,
        preco_anterior: p.preco_anterior,
        imagem_url: p.imagem_url
      };
    }).sort((a, b) => b.id - a.id);
    const total = d.carrinho_itens.reduce((sum, it) => sum + (it.quantidade || 0), 0);
    res.json({ itens, total });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar carrinho: ' + error.message });
  }
});

app.post('/carrinho', (req, res) => {
  try {
    const d = readData();
    const { produto_id, quantidade } = req.body;
    const p = d.produtos.find(px => px.id === produto_id);
    if (!p) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    const existente = d.carrinho_itens.find(ci => ci.produto_id === produto_id);
    if (existente) {
      const nova = (existente.quantidade || 1) + (quantidade ? parseInt(quantidade) : 1);
      existente.quantidade = nova;
    } else {
      d.carrinho_itens.push({
        id: nextId(d.carrinho_itens),
        produto_id,
        quantidade: quantidade ? parseInt(quantidade) : 1
      });
    }
    writeData(d);
    const total = d.carrinho_itens.reduce((sum, it) => sum + (it.quantidade || 0), 0);
    res.status(201).json({ message: 'Item adicionado ao carrinho', total });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar item: ' + error.message });
  }
});

app.delete('/carrinho/:id', (req, res) => {
  try {
    const d = readData();
    const id = parseInt(req.params.id);
    const idx = d.carrinho_itens.findIndex(ci => ci.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Item do carrinho não encontrado' });
    }
    d.carrinho_itens.splice(idx, 1);
    writeData(d);
    res.json({ message: 'Item removido do carrinho' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover item: ' + error.message });
  }
});

app.put('/carrinho/:id', (req, res) => {
  try {
    const d = readData();
    const id = parseInt(req.params.id);
    const { quantidade } = req.body;
    const ci = d.carrinho_itens.find(x => x.id === id);
    if (!ci) {
      return res.status(404).json({ error: 'Item do carrinho não encontrado' });
    }
    if (quantidade <= 0) {
      d.carrinho_itens = d.carrinho_itens.filter(x => x.id !== id);
      writeData(d);
      return res.json({ message: 'Item removido do carrinho' });
    }
    ci.quantidade = quantidade;
    writeData(d);
    const total = d.carrinho_itens.reduce((sum, it) => sum + (it.quantidade || 0), 0);
    res.json({ message: 'Quantidade atualizada', total });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar item: ' + error.message });
  }
});

const DEFAULT_PORT = parseInt(process.env.PORT) || 3000;
const MAX_TRIES = 10;

function startServer(port, triesLeft) {
  const server = app.listen(port, () => {
    const d = readData();
    const total = d.produtos.length;
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Total de produtos cadastrados: ${total}`);
  });
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && triesLeft > 0) {
      const nextPort = port + 1;
      console.log(`Porta ${port} em uso, tentando ${nextPort}...`);
      startServer(nextPort, triesLeft - 1);
    } else {
      throw err;
    }
  });
}

startServer(DEFAULT_PORT, MAX_TRIES);

