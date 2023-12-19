import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
    return {
        plugins: [
            react(),
            createHtmlPlugin({
                minify: false,
                entry: 'index.tsx',
                template:
                    mode === 'production' ? 'index.prod.html' : 'index.html',
            }),
            viteStaticCopy({
                targets: [
                    {
                        src: './public/**/*',
                        dest: './',
                    },
                ],
            }),
        ],
        build: {
            minify: false,
        },
    };
});
