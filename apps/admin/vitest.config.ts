import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// admin 前端测试：jsdom + Testing Library。覆盖率门槛 = TDD 的牙齿（棘轮，只升不降）。
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/main.tsx', // 挂载入口（ReactDOM.render），不在单测范围
        'src/test-setup.ts',
      ],
      thresholds: {
        // 基线（2026-06-03）：Lines/Stmts 99.2% · Branch 87.8% · Funcs 78.6%。
        // 门槛设基线略下方，只防退化、不脆。只升不降。
        lines: 90,
        functions: 70,
        branches: 80,
        statements: 90,
      },
    },
  },
});
