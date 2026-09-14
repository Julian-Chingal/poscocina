import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, queryClient } from './index.js';

async function main() {
  console.log('⏳ Running database migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('✅ Migrations completed successfully!');
  await queryClient.end();
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
