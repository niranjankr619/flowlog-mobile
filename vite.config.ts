import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaResolver() {
  return {
    name: 'figma-resolver',
    async resolveId(id, importer, options) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
      if (id.startsWith('jsr:@supabase/supabase-js')) {
        return this.resolve('@supabase/supabase-js', importer, { skipSelf: true, ...options })
      }
      // Match scoped packages with version e.g. @radix-ui/react-dialog@1.1.6
      const scopedMatch = id.match(/^(@[^/]+\/[^@]+)@[0-9]/)
      if (scopedMatch) {
        return this.resolve(scopedMatch[1], importer, { skipSelf: true, ...options })
      }
      // Match non-scoped packages with version e.g. sonner@2.0.3, cmdk@1.1.1
      const normalMatch = id.match(/^([^@/]+)@[0-9]/)
      if (normalMatch) {
        return this.resolve(normalMatch[1], importer, { skipSelf: true, ...options })
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaResolver(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/app'),
    },
  },
})
