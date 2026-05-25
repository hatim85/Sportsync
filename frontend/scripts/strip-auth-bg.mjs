/**
 * DISABLED — background stripping removed dark product pixels (e.g. black bag → white ghost).
 * Auth carousel uses original PNGs from public/auth unchanged.
 *
 * To restore originals only:
 *   cp ~/.cursor/projects/.../assets/auth-*.png public/auth/
 */
console.error(
  'strip-auth-bg is disabled. Product images must stay unmodified. Copy originals to public/auth/ instead.',
);
process.exit(1);
