/**
 * Auth ring — PNG cutouts in public/auth (*-removebg-preview.png).
 * Do NOT run strip-auth-bg (it alters product colors).
 */
const v = 'rb5';
export const AUTH_RING_ASSETS = [
  { src: `/auth/auth-cricket-removebg-preview.png?v=${v}`, alt: 'Cricket gear' },
  { src: `/auth/auth-football-removebg-preview.png?v=${v}`, alt: 'Football gear' },
  { src: `/auth/auth-badminton-removebg-preview.png?v=${v}`, alt: 'Badminton gear' },
  { src: `/auth/auth-fitness-removebg-preview.png?v=${v}`, alt: 'Fitness equipment' },
  { src: `/auth/auth-running-removebg-preview.png?v=${v}`, alt: 'Running shoes' },
  { src: `/auth/auth-accessories-removebg-preview.png?v=${v}`, alt: 'Sports accessories' },
];
