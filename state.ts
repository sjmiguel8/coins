import { proxy } from 'valtio';

export const state = proxy({
  points: 0,
  multiplier: 1,
  time: 0,
});
