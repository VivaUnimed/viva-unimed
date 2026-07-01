/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: './test/setup.ts',
    fileParallelism: false,
    isolate: false,
    sequence: {
      shuffle: false, // Ensures tests are not randomized
      concurrent: false // Ensures tests are not parallelized by default
    }
  },
});
