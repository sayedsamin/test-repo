import "@testing-library/jest-dom";

// Polyfill for Next.js Web APIs in Node environment
const { TextEncoder, TextDecoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch for Next.js
global.fetch = jest.fn();

// Keep console for debugging
// Can be suppressed later if needed
