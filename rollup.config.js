import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import builtins from 'builtin-modules';
import { terser } from 'rollup-plugin-terser';
import del from 'rollup-plugin-delete';

const SOURCE_PATH = 'src/lambda-fns/shorten/';
const DIST_PATH = 'lib/lambda-fns/shorten/';

export default {
  input: path.join(__dirname, SOURCE_PATH, 'index.ts'),
  output: {
    dir: DIST_PATH,
    format: 'cjs',
    sourcemap: false,
  },
  external: [...builtins, 'aws-sdk', 'aws-lambda'],
  plugins: [
    del({
      targets: DIST_PATH,
      verbose: true,
    }),
    resolve({
      preferBuiltins: true,
      extensions: ['.mjs', '.js', '.jsx', '.json', '.ts'],
    }),
    commonjs(),
    typescript({
      typescript: require('typescript'),
      include: ['src/lambda-fns/**/*.ts'],
      tsconfigOverride: {
        compilerOptions: {
          allowSyntheticDefaultImports: true,
          declaration: false,
          inlineSourceMap: false,
          inlineSources: false,
          module: 'ES2015',
          outDir: DIST_PATH,
        },
      },
    }),
    terser(),
  ],
};
