import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    proxy: {
      '/api/slack': {
        target: 'https://slack.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/slack/, ''),
      },
      '/api/jira': {
        target: 'https://dummy.atlassian.net',
        changeOrigin: true,
        router: (req) => {
          const match = req.url?.match(/^\/api\/jira\/([^/]+)/);
          return match ? `https://${match[1]}` : 'https://dummy.atlassian.net';
        },
        rewrite: (path) => path.replace(/^\/api\/jira\/[^/]+/, ''),
      },
    },
  },
})
