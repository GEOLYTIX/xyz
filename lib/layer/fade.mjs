export default function fade(layer, out) {

    if (!layer?.fade) return;

    // Clear current fade process.
    clearTimeout(layer.fade)

    // Get current opacity.
    let opacity = layer.L.getOpacity()

    if (out) {

        // Layer is completely transparent.
        if (opacity <= 0) return;

        // Reduce opacity by 20%.
        opacity -= 0.2

    } else {

        // Layer is completely opaque
        if (opacity >= 1) return;

        // Increase opacity by 20%.
        opacity += 0.2
    }

    layer.L.setOpacity(opacity)

    // Continue fade sequence after timeout delay.
    layer.fade = setTimeout(() => fade(layer, out), 100)
}