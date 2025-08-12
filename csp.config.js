// Content Security Policy Configuration for NMC Total
// This file defines security policies to prevent XSS and other attacks

const cspConfig = {
  // Default source policy - restrict to self
  'default-src': ["'self'"],
  
  // Script sources - allow self and inline scripts for React
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for React development
    "'unsafe-eval'",   // Required for React development
    "data:"
  ],
  
  // Style sources - allow self and inline styles
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled components
    "data:",
    "blob:"
  ],
  
  // Image sources
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:"
  ],
  
  // Font sources
  'font-src': [
    "'self'",
    "data:"
  ],
  
  // Connect sources - for API calls
  'connect-src': [
    "'self'",
    "ws://localhost:*", // For development server
    "wss://localhost:*",
    "https://api.github.com", // For updates
    "https://registry.npmjs.org" // For package updates
  ],
  
  // Media sources
  'media-src': ["'self'"],
  
  // Object sources - restrict plugins
  'object-src': ["'none'"],
  
  // Base URI restriction
  'base-uri': ["'self'"],
  
  // Form action restriction
  'form-action': ["'self'"],
  
  // Frame ancestors - prevent clickjacking
  'frame-ancestors': ["'none'"],
  
  // Frame sources
  'frame-src': ["'none'"],
  
  // Worker sources
  'worker-src': ["'self'", "blob:"],
  
  // Manifest source
  'manifest-src': ["'self'"],
  
  // Upgrade insecure requests
  'upgrade-insecure-requests': true,
  
  // Block mixed content
  'block-all-mixed-content': true
};

// Convert to CSP header string
function generateCSPHeader() {
  const policies = [];
  
  for (const [directive, sources] of Object.entries(cspConfig)) {
    if (typeof sources === 'boolean' && sources) {
      policies.push(directive);
    } else if (Array.isArray(sources)) {
      policies.push(`${directive} ${sources.join(' ')}`);
    }
  }
  
  return policies.join('; ');
}

// Development CSP (more permissive)
const developmentCSP = {
  ...cspConfig,
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "data:",
    "localhost:*"
  ],
  'connect-src': [
    "'self'",
    "ws://localhost:*",
    "wss://localhost:*",
    "http://localhost:*",
    "https://localhost:*",
    "https://api.github.com",
    "https://registry.npmjs.org"
  ]
};

// Production CSP (more restrictive)
const productionCSP = {
  ...cspConfig,
  'script-src': ["'self'"],
  'style-src': ["'self'"],
  'connect-src': [
    "'self'",
    "https://api.github.com"
  ]
};

module.exports = {
  cspConfig,
  developmentCSP,
  productionCSP,
  generateCSPHeader
};