const watchers = new WeakMap();

export function connectionWire(host, owner) {
    if (!host || watchers.has(host)) {
        return navigator.onLine;
    }

    const watcher = new AbortController();
    const { signal } = watcher;

    window.addEventListener('online', () => owner.invokeMethodAsync('Changed', true), { signal });
    window.addEventListener('offline', () => owner.invokeMethodAsync('Changed', false), { signal });

    watchers.set(host, watcher);

    return navigator.onLine;
}

export function connectionFree(host) {
    watchers.get(host)?.abort();
    watchers.delete(host);
}
