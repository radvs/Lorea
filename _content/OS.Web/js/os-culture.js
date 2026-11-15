export function cultureApply(language, direction) {
    const root = document.documentElement;
    root.lang = language;
    root.dir = direction;
}
