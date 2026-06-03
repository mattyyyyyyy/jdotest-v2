// Testing Library 的自定义匹配器（toBeInTheDocument 等）+ 每个用例后清理 DOM。
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
