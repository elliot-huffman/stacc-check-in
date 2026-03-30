import { eslintConfig as baseConfig } from '@shi-corp/development-utilities/optimized/lint/base.js';
import { eslintConfig as nextConfig } from '@shi-corp/development-utilities/optimized/lint/next.js';
import { defineConfig } from 'eslint/config';

// Linting configuration used for the runtime and UI as defined by SHI.
export default defineConfig([
    ...baseConfig.map(config => ({ ...config, 'files': ['runtime/**/*.{ts,js}'] })),
    ...nextConfig.map(config => ({ ...config, 'files': ['user-interface/**/*.{ts,js,tsx}'] })),
]);
