/**
 * Utility function to retrieve a CSS variable’s computed pixel value.
 */
export default function getCssVarPx(
    varName: string,
    fallback: number = 0
): number {
    const tmp = document.createElement('div');
    tmp.style.position = 'absolute';
    tmp.style.visibility = 'hidden';
    tmp.style.height = `var(${varName})`;
    document.body.appendChild(tmp);

    const computed = getComputedStyle(tmp).height;
    document.body.removeChild(tmp);

    const px = parseFloat(computed);
    return Number.isNaN(px) ? fallback : px;
}
