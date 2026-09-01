const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { auditExtension } = require('./src/prisma/audit.extension'); // Ajuste conforme necessário

async function main() {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool as any);
    const prisma = auditExtension(new PrismaClient({ adapter }));

    await prisma.$connect();
    console.log('Conexão com Banco de Dados OK!');
    await prisma.$disconnect();
  } catch (e) {
    console.error('Erro de conexão com Banco:', e);
    process.exit(1);
  }
}

main();
