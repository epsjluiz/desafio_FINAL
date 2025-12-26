import { getDb, migrate } from '../_db.js';
export default async function handler(req, res) {
  await migrate();
  const db = getDb();
  const id = parseInt((req.query.id) || '0', 10);
  if (!id) { res.status(400).json({ error: 'ID inválido' }); return; }
  if (req.method === 'DELETE') {
    await db.execute({ sql: `DELETE FROM carrinho_itens WHERE id = ?`, args: [id] });
    res.status(200).json({ message: 'Item removido do carrinho' });
    return;
  }
  if (req.method === 'PUT') {
    const { quantidade } = req.body || {};
    const r = await db.execute({ sql: `SELECT * FROM carrinho_itens WHERE id = ?`, args: [id] });
    if (!r.rows[0]) { res.status(404).json({ error: 'Item do carrinho não encontrado' }); return; }
    if ((quantidade) <= 0) {
      await db.execute({ sql: `DELETE FROM carrinho_itens WHERE id = ?`, args: [id] });
      res.status(200).json({ message: 'Item removido do carrinho' });
      return;
    }
    await db.execute({ sql: `UPDATE carrinho_itens SET quantidade = ? WHERE id = ?`, args: [quantidade, id] });
    const totalRes = await db.execute(`SELECT COALESCE(SUM(quantidade),0) as total FROM carrinho_itens`);
    const total = (totalRes.rows[0]?.total) || 0;
    res.status(200).json({ message: 'Quantidade atualizada', total });
    return;
  }
  res.status(405).json({ error: 'Método não suportado' });
}

