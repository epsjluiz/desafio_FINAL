import { createClient } from '@libsql/client';
let client = null;
export function getDb() {
  if (client) return client;
  const url = process.env.LIBSQL_URL;
  const token = process.env.LIBSQL_TOKEN;
  if (!url) throw new Error('LIBSQL_URL not set');
  client = createClient({ url, authToken: token });
  return client;
}
export async function migrate() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      preco REAL NOT NULL,
      preco_anterior REAL,
      imagem_url TEXT
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS carrinho_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produto_id INTEGER NOT NULL,
      quantidade INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

