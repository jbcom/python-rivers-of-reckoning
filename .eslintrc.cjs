module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', '@typescript-eslint', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    // React Three Fiber uses many custom props that ESLint doesn't recognize
    'react/no-unknown-property': ['error', {
      ignore: [
        // Three.js mesh properties
        'geometry', 'material', 'position', 'rotation', 'scale',
        'castShadow', 'receiveShadow', 'args', 'attach',
        // Material properties
        'vertexColors', 'roughness', 'metalness', 'transparent', 'side',
        'uniforms', 'vertexShader', 'fragmentShader', 'wireframe',
        'emissive', 'emissiveIntensity', 'color', 'opacity',
        // Light properties
        'intensity', 'shadow-mapSize', 'shadow-camera-left', 'shadow-camera-right',
        'shadow-camera-top', 'shadow-camera-bottom', 'shadow-bias', 'shadow-radius',
        // Camera properties
        'fov', 'near', 'far', 'aspect',
        // Other Three.js properties
        'object', 'dispose', 'frustumCulled', 'visible', 'renderOrder',
      ]
    }],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
  },
}
