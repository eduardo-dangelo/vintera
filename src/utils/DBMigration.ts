import path from 'node:path';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDbConnection } from './DBConnection';

// Create a new and dedicated database connection for running migrations
const db = createDbConnection();

try {
  console.warn('🔄 Running database migrations...');
  console.warn('📁 Migrations folder:', path.join(process.cwd(), 'migrations'));

  // Check if migrations table exists
  try {
    const migrationsCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '__drizzle_migrations'
      );
    `);
    const migrationsTableExists = migrationsCheck.rows[0]?.exists;
    console.warn('📦 Migrations table exists:', migrationsTableExists);

    if (migrationsTableExists) {
      const appliedMigrations = await db.execute(sql`
        SELECT hash, created_at FROM __drizzle_migrations ORDER BY created_at;
      `);
      console.warn(`📝 Found ${appliedMigrations.rows.length} applied migrations`);
      appliedMigrations.rows.forEach((m: any) => {
        console.warn(`   - ${m.hash} (${m.created_at})`);
      });
    }
  } catch {
    console.warn('⚠️  Could not check migrations table (this is OK if database is fresh)');
  }

  const migrationsFolder = path.join(process.cwd(), 'migrations');
  console.warn('📂 Migrations folder path:', migrationsFolder);

  // Check if migrations folder exists and has files
  try {
    const fs = await import('node:fs/promises');
    const files = await fs.readdir(migrationsFolder);
    const sqlFiles = files.filter(f => f.endsWith('.sql'));
    console.warn(`📄 Found ${sqlFiles.length} SQL migration files:`, sqlFiles);
  } catch (dirError) {
    console.error('❌ Error reading migrations folder:', dirError);
  }

  try {
    console.warn('🚀 Calling migrate() function...');
    await migrate(db, {
      migrationsFolder,
    });
    console.warn('✅ migrate() function completed without errors');
  } catch (migrateError) {
    console.error('❌ Error during migrate() call:', migrateError);
    if (migrateError instanceof Error) {
      console.error('❌ Migrate error message:', migrateError.message);
      console.error('❌ Migrate error stack:', migrateError.stack);
    }
    throw migrateError;
  }

  // Verify assets table was created
  const assetsCheck = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'assets'
    );
  `);
  const assetsExists = assetsCheck.rows[0]?.exists;
  console.warn('✅ Assets table exists:', assetsExists);

  if (!assetsExists) {
    // Check what tables DO exist
    const allTables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.warn('📋 Existing tables in database:', allTables.rows.map((r: any) => r.table_name));

    // Check if migrations table was created
    const migrationsTableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '__drizzle_migrations'
      );
    `);
    console.warn('📦 Migrations table exists after migrate():', migrationsTableCheck.rows[0]?.exists);

    throw new Error('Assets table was not created after migrations!');
  }

  console.warn('✅ Migrations completed successfully');
} catch (error) {
  console.error('❌ Migration error:', error);
  if (error instanceof Error) {
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
  }
  throw error;
} finally {
  await db.$client.end();
}
