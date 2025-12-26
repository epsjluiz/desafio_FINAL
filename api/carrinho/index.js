import { getDb, migrate } from '../_db.js';
export default async function handler(req, res) {
  await migrate();
  const db = getDb();
  if (req.method === 'GET') {
    const itens = await db.execute(`
      SELECT ci.id, ci.quantidade, p.id as produto_id, p.nome, p.preco, p.preco_anterior, p.imagem_url
      FROM carrinho_itens ci
      JOIN produtos p ON p.id = ci.produto_id
      ORDER BY ci.id DESC
    `);
    const totalRes = await db.execute(`SELECT COALESCE(SUM(quantidade),0) as total FROM carrinho_itens`);
    const total = (totalRes.rows[0]?.total) || 0;
    res.status(200).json({ itens: itens.rows, total });
    return;
  }
  if (req.method === 'POST') {
    const { produto_id, quantidade } = req.body || {};
    if (!produto_id) { res.status(400).json({ error: 'produto_id é obrigatório' }); return; }
    const prod = await db.execute({ sql: `SELECT * FROM produtos WHERE id = ?`, args: [produto_id] });
    if (!prod.rows[0]) { res.status(404).json({ error: 'Produto não encontrado' }); return; }
    const existente = await db.execute({ sql: `SELECT * FROM carrinho_itens WHERE produto_id = ?`, args: [produto_id] });
    if (existente.rows[0]) {
      const nova = ((existente.rows[0].quantidade) || 1) + (quantidade ? parseInt(quantidade, 10) : 1);
      await db.execute({ sql: `UPDATE carrinho_itens SET quantidade = ? WHERE id = ?`, args: [nova, existente.rows[0].id] });
    } else {
      await db.execute({ sql: `INSERT INTO carrinho_itens (produto_id, quantidade) VALUES (?, ?)`, args: [produto_id, quantidade ? parseInt(quantidade, 10) : 1] });
    }
    const totalRes = await db.execute(`SELECT COALESCE(SUM(quantidade),0) as total FROM carrinho_itens`);
    const total = (totalRes.rows[0]?.total) || 0;
    res.status(201).json({ message: 'Item adicionado ao carrinho', total });
    return;
  }
  res.status(405).json({ error: 'Método não suportado' });
}

