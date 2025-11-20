import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from '../../drizzle/schema';

// Load environment variables from .env file
dotenv.config();

// Create the connection
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not defined in environment variables. Please check your .env file.',
  );
}

// For query purposes
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

// Export the schema for use in other parts of the application
export { schema };

