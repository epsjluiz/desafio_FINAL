import { getDb, migrate } from '../_db.js';
export default async function handler(req, res) {
  await migrate();
  const db = getDb();
  if (req.method === 'GET') {
    const result = await db.execute(`SELECT * FROM produtos ORDER BY id`);
    res.status(200).json(result.rows);
    return;
  }
  if (req.method === 'POST') {
    const { nome, preco, preco_anterior, imagem_url } = req.body || {};
    if (!nome || !preco) {
      res.status(400).json({ error: 'Nome e preço são obrigatórios' });
      return;
    }
    const r = await db.execute({
      sql: `INSERT INTO produtos (nome, preco, preco_anterior, imagem_url) VALUES (?, ?, ?, ?)`,
      args: [nome, parseFloat(preco), preco_anterior ? parseFloat(preco_anterior) : null, imagem_url || '']
    });
    const id = (r.lastInsertRowid) || 0;
    res.status(201).json({ id, message: 'Produto adicionado com sucesso' });
    return;
  }
  res.status(405).json({ error: 'Método não suportado' });
}

