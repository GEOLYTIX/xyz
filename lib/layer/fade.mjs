export default function fade(layer, out) {

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
        //Current time use to calculate the elapsed time. 
        const currentTime = Date.now();

        const elapsedTime = currentTime - startTime;

        //if elapsted time is less than the animation duration then we will use interpolation.
        if (elapsedTime < duration) {
            const progress = elapsedTime / duration;
            const interpolatedOpacity = currentOpacity + (targetOpacity - currentOpacity) * progress;
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