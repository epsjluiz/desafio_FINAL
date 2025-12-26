import { getDb, migrate } from '../_db.js';
export default async function handler(req, res) {
  await migrate();
  const db = getDb();
  const id = parseInt((req.query.id) || '0', 10);
  if (!id) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  if (req.method === 'GET') {
    const r = await db.execute({ sql: `SELECT * FROM produtos WHERE id = ?`, args: [id] });
    const row = r.rows[0];
    if (!row) { res.status(404).json({ error: 'Produto não encontrado' }); return; }
    res.status(200).json(row);
    return;
  }
  if (req.method === 'PUT') {
    const { nome, preco, preco_anterior, imagem_url } = req.body || {};
    if (!nome || !preco) { res.status(400).json({ error: 'Nome e preço são obrigatórios' }); return; }
    await db.execute({
      sql: `UPDATE produtos SET nome = ?, preco = ?, preco_anterior = ?, imagem_url = ? WHERE id = ?`,
      args: [nome, parseFloat(preco), preco_anterior ? parseFloat(preco_anterior) : null, imagem_url || '', id]
    });
    res.status(200).json({ message: 'Produto atualizado com sucesso' });
    return;
  }
  if (req.method === 'DELETE') {
    await db.execute({ sql: `DELETE FROM produtos WHERE id = ?`, args: [id] });
    res.status(200).json({ message: 'Produto excluído com sucesso' });
    return;
  }
  res.status(405).json({ error: 'Método não suportado' });
}

