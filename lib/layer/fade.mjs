/**
### mapp.layer.fade()

The `fade()` animation function implements linear interpolation to achieve a smooth transition between opacities on a the cluster layer format. 

The fade will occur during the zoom in and out as well as changing the view port.

### 🎯 Target Opacity Calculation: 
Depending on whether fading in or out, the target opacity is calculated. 
If fading out, the opacity is reduced by 20% or brought to a minimum of 0. 
If fading in, the opacity is increased by 20% or limited to a maximum of 1.

### ⏱️ Animation Duration and Timing: 
The animation duration is set to 100 milliseconds (adjustable), and the start time of the animation is recorded.

### 📊 Opacity Update Function: 
The `updateOpacity` function is used to calculate the current time and elapsed time since the animation started.

### 🌟 Interpolation and Opacity Update:
If the elapsed time is less than the animation duration, interpolation is used to smoothly transition the opacity between `currentOpacity` and `targetOpacity`. 
The `requestAnimationFrame` is used to schedule the next frame of the animation. 
When the animation duration has elapsed, the layer's opacity is set to the `targetOpacity`, concluding the animation.

### 🚀 Starting the Animation: 
The animation is triggered by calling the `updateOpacity` function.

### ⏳ Setting New Timeout:
A new fade timeout is set for the next step of the fade animation after the specified duration has passed, ensuring the animation continues until the desired opacity is reached.

@module /layer/fade
@param {boolean} out - Indicates whether the layer should be faded out (`true`) or faded in (`false`).
@example
"layer": {
  "fade": true
}
*/

export default function fade(layer, out) {
  // Check if the layer has a fade property.
  if (!layer?.fade) return;

  // Clear current fade process.
  clearTimeout(layer.fade);

  // Get current opacity.
  const currentOpacity = layer.L.getOpacity();

  let targetOpacity;

  if (out) {
    // Layer is completely transparent.
    if (currentOpacity <= 0) return;

    // Reduce opacity by 20%.
    targetOpacity = Math.max(currentOpacity - 0.2, 0);
  } else {
    // Layer is completely opaque.
    if (currentOpacity >= 1) return;

    // Increase opacity by 20%.
    targetOpacity = Math.min(currentOpacity + 0.2, 1);
  }

  const duration = 100; // Animation duration in milliseconds

  const startTime = Date.now();
  const updateOpacity = () => {
    // Current time used to calculate the elapsed time.
    const currentTime = Date.now();

    const elapsedTime = currentTime - startTime;

    // If elapsed time is less than the animation duration, then we will use interpolation.
    if (elapsedTime < duration) {
      const progress = elapsedTime / duration;
      const interpolatedOpacity =
        currentOpacity + (targetOpacity - currentOpacity) * progress;
      layer.L.setOpacity(interpolatedOpacity);

      // Continue updating opacity.
      requestAnimationFrame(updateOpacity);
    } else {
      // Animation complete, set the final opacity.
      layer.L.setOpacity(targetOpacity);
    }
  };

  // Start the animation.
  updateOpacity();

  // Set the new fade timeout.
  layer.fade = setTimeout(() => fade(layer, out), duration);
}
