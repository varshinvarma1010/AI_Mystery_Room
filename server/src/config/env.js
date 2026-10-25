import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

let parsedEnv;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.warn('⚠️ Missing or invalid environment variables:');
    error.errors.forEach((err) => {
      console.warn(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
  // Provide safe fallback defaults so app scaffolding and tests can run even before user sets secrets
  parsedEnv = {
    PORT: parseInt(process.env.PORT || '5000', 10),
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_mystery_room',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'dummy_gemini_key',
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    NODE_ENV: process.env.NODE_ENV || 'development'
  };
}

export const env = parsedEnv;
