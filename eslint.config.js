import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },
  {
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/node_modules/**'],
  },
  ...pluginVue.configs['flat/essential'],
  skipFormatting,
  {
    rules: {
      // 允许单词组件名（如 Chart, layout 等）
      'vue/multi-word-component-names': 'off',
      // 允许 props 变异（某些场景下需要）
      'vue/no-mutating-props': 'warn'
    }
  }
]
