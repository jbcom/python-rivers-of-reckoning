import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unknown-property': ['error', {
        ignore: [
          'geometry', 'material', 'position', 'rotation', 'scale',
          'castShadow', 'receiveShadow', 'args', 'attach',
          'vertexColors', 'roughness', 'metalness', 'transparent', 'side',
          'uniforms', 'vertexShader', 'fragmentShader', 'wireframe',
          'emissive', 'emissiveIntensity', 'color', 'opacity',
          'intensity', 'shadow-mapSize', 'shadow-camera-left', 'shadow-camera-right',
          'shadow-camera-top', 'shadow-camera-bottom', 'shadow-bias', 'shadow-radius',
          'fov', 'near', 'far', 'aspect',
          'object', 'dispose', 'frustumCulled', 'visible', 'renderOrder',
        ]
      }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['capacitor.config.ts', 'playwright.config.ts', 'vite.config.ts', 'tests/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },
);
