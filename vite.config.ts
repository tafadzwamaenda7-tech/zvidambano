import { defineConfig } from 'vite';
import { resolve } from 'path';

const htmlFiles = [
  'index', 'about', 'careers', 'clients', 'contact', 'faq', 'insights',
  'products', 'login', 'terms', 'privacy',
  'farmer-dashboard', 'zvida-dashboard', 'offtaker-dashboard', 'vendor-dashboard', 'driver-dashboard',
  'support-dashboard',
];

const input: Record<string, string> = {};
for (const name of htmlFiles) {
  input[name] = resolve(__dirname, `${name}.html`);
}

export default defineConfig({
  build: {
    rollupOptions: {
      input,
    },
  },
});
