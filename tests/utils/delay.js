export function delayFunction(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}
