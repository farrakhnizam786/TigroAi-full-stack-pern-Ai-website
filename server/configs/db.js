import { neon } from '@neondatabase/serverless';

// Create the connection pool
const sql = neon(process.env.NEON_DATABASE_URL);

// Export for use in your application
export default sql;