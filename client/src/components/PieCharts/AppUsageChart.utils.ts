/**
 * Measures the rendered width of arbitrary text given the font size and font face
 * @param {string} text The text to measure
 * @param {number} fontSize The font size in pixels
 * @param {string} fontFace The font face ("Arial", "Helvetica", etc.)
 * @returns {number} The width of the text
 * */
export function getTextWidth(text, fontSize, fontFace) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
        console.warn('No 2d context');
        return 0;
    }
    context.font = `${fontSize}px ${fontFace}`;
    return context.measureText(text).width;
}
