import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    server: {
        https: {
            key: fs.readFileSync('./localhost-key.pem'),
            cert: fs.readFileSync('./localhost.pem'),
        },
        port: 5173,
        strictPort: true,
    }
})