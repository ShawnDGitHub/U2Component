export const EASING = {
  STANDARD: 'cubic-bezier(0.2, 0, 0, 1)',
  STANDARD_ACCELERATE: 'cubic-bezier(.3,0,1,1)',
  STANDARD_DECELERATE: 'cubic-bezier(0,0,0,1)',
  EMPHASIZED: 'cubic-bezier(.3,0,0,1)',
  EMPHASIZED_ACCELERATE: 'cubic-bezier(.3,0,.8,.15)',
  EMPHASIZED_DECELERATE: 'cubic-bezier(.05,.7,.1,1)',
};
export function createAnimationSignal() {
  let animationAbortController = null;

  return {
    start() {
      // Tell the previous animation to cancel.
      animationAbortController?.abort();
      // Set up a new AbortController for the current animation.
      animationAbortController = new AbortController();
      // Provide the AbortSignal so that the caller can check aborted status
      // and add listeners.
      return animationAbortController.signal;
    },
    finish() {
      animationAbortController = null;
    },
  };
}
