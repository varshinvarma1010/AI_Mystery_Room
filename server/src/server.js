import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`🕵️‍♂️ AI Mystery Room Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    console.log(`📡 Client URL allowed: ${env.CLIENT_URL}`);
    console.log(`🤖 Gemini Model configured: ${env.GEMINI_MODEL}`);
  });
};

startServer();
