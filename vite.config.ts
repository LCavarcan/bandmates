import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base './' permite servir o build a partir de qualquer pasta (útil para um futuro executável).
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
