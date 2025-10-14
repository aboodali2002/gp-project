/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import("next").NextConfig} */
const ROOT_DIR = dirname(fileURLToPath(import.meta.url));

const config = {
  experimental: {
    turbopack: {
      root: ROOT_DIR,
    },
  },
};

export default withNextIntl(config);
