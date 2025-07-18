import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'functions/index.js',
  output: {
    file: 'functions/dist/index.js',
    format: 'es',
    sourcemap: !isProduction,
  },
  plugins: [
    nodeResolve({
      preferBuiltins: true,
      browser: false,
    }),
    commonjs(),
    json(),
    ...(isProduction ? [terser()] : []),
  ],
  external: ['cloudflare:workers'],
};