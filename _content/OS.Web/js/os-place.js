export const MARGIN = 8;

export function clampToView(value, size, viewSize) {
    return Math.min(Math.max(value, MARGIN), Math.max(viewSize - size - MARGIN, MARGIN));
}

export function placeBelowOrAbove(panel, rect, gap) {
    const inset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--os-inset-bottom')) || 0;
    const spaceBelow = window.innerHeight - inset - rect.bottom - gap - MARGIN;
    const spaceAbove = rect.top - gap - MARGIN;

    panel.style.maxHeight = '';

    const natural = panel.offsetHeight;
    const openUp = natural > spaceBelow && spaceAbove > spaceBelow;
    const space = Math.max(0, openUp ? spaceAbove : spaceBelow);

    if (natural > space) {
        panel.style.maxHeight = `${space}px`;
    }

    const height = Math.min(natural, space);

    panel.style.top = openUp
        ? `${rect.top - height - gap}px`
        : `${rect.bottom + gap}px`;
}
