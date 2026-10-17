const darkQuery = '(prefers-color-scheme: dark)';

let watcher = null;

export function themeApply(attr, value, scheme) {
    const root = document.documentElement;
    root.setAttribute(attr, value);
    root.style.colorScheme = scheme;
}

export function systemDark() {
    return matchMedia(darkQuery).matches;
}

export function watchSystem(ref) {
    stopSystem();
    watcher = new AbortController();

    matchMedia(darkQuery).addEventListener(
        'change',
        event => ref.invokeMethodAsync('SystemChanged', event.matches),
        { signal: watcher.signal });
}

export function stopSystem() {
    watcher?.abort();
    watcher = null;
}
