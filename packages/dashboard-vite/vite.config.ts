import { resolve } from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(isLib
        ? [dts({ include: ['src'], rollupTypes: true, insertTypesEntry: true })]
        : []),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: isLib
      ? {
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'MediamtxDashboard',
            fileName: 'mediamtx-dashboard',
            formats: ['es'],
          },
          rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'],
            output: {
              assetFileNames: 'mediamtx-dashboard[extname]',
            },
          },
          cssCodeSplit: false,
        }
      : {
          outDir: 'dist-app',
        },
    server: {
      port: 5173,
    },
  }
})
