import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env from the project root directory
  const env = loadEnv(mode, process.cwd(), '');

  // Debug: Log during build to verify keys are loaded
  console.log('[Vite Config] Env keys found:', Object.keys(env).filter(k => k.includes('API_KEY')));

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
