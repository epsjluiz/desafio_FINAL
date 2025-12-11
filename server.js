import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();

const db = new Database('produtos.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    preco REAL NOT NULL,
    imagem_url TEXT
  )
`);

// Carrinho
db.exec(`
  CREATE TABLE IF NOT EXISTS carrinho_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// Migração: garantir coluna preco_anterior existe
try {
  const cols = db.prepare("PRAGMA table_info(produtos)").all();
  const hasPrecoAnterior = cols.some((c) => c.name === 'preco_anterior');
  if (!hasPrecoAnterior) {
    db.exec('ALTER TABLE produtos ADD COLUMN preco_anterior REAL');
  }
} catch (e) {
  console.error('Falha ao verificar/adicionar coluna preco_anterior:', e);
}

const countResult = db.prepare('SELECT COUNT(*) as total FROM produtos').get();
if (countResult && countResult.total === 0) {
  const insert = db.prepare('INSERT INTO produtos (nome, preco, imagem_url) VALUES (?, ?, ?)');
  

  const insertMany = db.transaction((produtos) => {
    for (const produto of produtos) {
      insert.run(produto[0], produto[1], produto[2]);
    }
  });

  insertMany(produtosIniciais);
  console.log('Dados iniciais inseridos no banco de dados');
}

app.use(cors());
app.use(express.json());

app.get('/produtos', (req, res) => {
  try {
    const produtos = db.prepare('SELECT * FROM produtos ORDER BY id').all();
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos: ' + error.message });
  }
});

app.get('/produtos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
    
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
    const { nome, preco, preco_anterior, imagem_url } = req.body;
    
    if (!nome || !preco) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    const insert = db.prepare('INSERT INTO produtos (nome, preco, preco_anterior, imagem_url) VALUES (?, ?, ?, ?)');
    const result = insert.run(nome, parseFloat(preco), preco_anterior ? parseFloat(preco_anterior) : null, imagem_url || '');

    res.status(201).json({
      id: result.lastInsertRowid,
      message: 'Produto adicionado com sucesso'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar produto: ' + error.message });
  }
});

app.put('/produtos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, preco, preco_anterior, imagem_url } = req.body;
    
    if (!nome || !preco) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    const produtoExistente = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
    
    if (!produtoExistente) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const update = db.prepare('UPDATE produtos SET nome = ?, preco = ?, preco_anterior = ?, imagem_url = ? WHERE id = ?');
    update.run(nome, parseFloat(preco), preco_anterior ? parseFloat(preco_anterior) : null, imagem_url || produtoExistente.imagem_url, id);

    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar produto: ' + error.message });
  }
});

app.delete('/produtos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
    
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const deleteProduto = db.prepare('DELETE FROM produtos WHERE id = ?');
    deleteProduto.run(id);

    res.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir produto: ' + error.message });
  }
});

// Carrinho endpoints
app.get('/carrinho', (req, res) => {
  try {
    const itens = db.prepare(`
      SELECT ci.id, ci.quantidade, p.id as produto_id, p.nome, p.preco, p.preco_anterior, p.imagem_url
      FROM carrinho_itens ci
      JOIN produtos p ON p.id = ci.produto_id
      ORDER BY ci.id DESC
    `).all();
    const totalItens = db.prepare('SELECT COALESCE(SUM(quantidade),0) as total FROM carrinho_itens').get();
    res.json({ itens, total: totalItens.total });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar carrinho: ' + error.message });
  }
});

app.post('/carrinho', (req, res) => {
  try {
    const { produto_id, quantidade } = req.body;
    const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(produto_id);
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    const existente = db.prepare('SELECT * FROM carrinho_itens WHERE produto_id = ?').get(produto_id);
    if (existente) {
      const novaQtde = (existente.quantidade || 1) + (quantidade ? parseInt(quantidade) : 1);
      db.prepare('UPDATE carrinho_itens SET quantidade = ? WHERE id = ?').run(novaQtde, existente.id);
    } else {
      db.prepare('INSERT INTO carrinho_itens (produto_id, quantidade) VALUES (?, ?)')
        .run(produto_id, quantidade ? parseInt(quantidade) : 1);
    }
    const totalItens = db.prepare('SELECT COALESCE(SUM(quantidade),0) as total FROM carrinho_itens').get();
    res.status(201).json({ message: 'Item adicionado ao carrinho', total: totalItens.total });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar item: ' + error.message });
  }
});

app.delete('/carrinho/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = db.prepare('SELECT * FROM carrinho_itens WHERE id = ?').get(id);
    if (!item) {
      return res.status(404).json({ error: 'Item do carrinho não encontrado' });
    }
    db.prepare('DELETE FROM carrinho_itens WHERE id = ?').run(id);
    res.json({ message: 'Item removido do carrinho' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover item: ' + error.message });
  }
});

const DEFAULT_PORT = parseInt(process.env.PORT) || 3000;
const MAX_TRIES = 10;

function startServer(port, triesLeft) {
  const server = app.listen(port, () => {
    const totalProdutos = db.prepare('SELECT COUNT(*) as total FROM produtos').get();
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Total de produtos cadastrados: ${totalProdutos.total}`);
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

process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
