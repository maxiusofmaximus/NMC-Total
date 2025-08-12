module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:security/recommended'
  ],
  plugins: [
    'security'
  ],
  rules: {
    // Security rules
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error',
    
    // React security rules
    'react/no-danger': 'error',
    'react/no-danger-with-children': 'error',
    'react/jsx-no-script-url': 'error',
    'react/jsx-no-target-blank': 'error',
    
    // General security best practices
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-alert': 'warn',
    'no-console': 'warn',
    'no-debugger': 'error',
    
    // Prevent potential XSS
    'no-inner-declarations': 'error',
    'no-multi-str': 'error',
    'no-new-wrappers': 'error',
    'no-octal-escape': 'error',
    
    // Prevent prototype pollution
    'no-proto': 'error',
    'no-extend-native': 'error'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
};