const watchers = new WeakMap();

export function dialogOpen(el, ref) {
    if (!el) {
        return;
    }

    if (!watchers.has(el)) {
        const watcher = new AbortController();

        el.addEventListener('close', () => ref.invokeMethodAsync('DialogClosed'), { signal: watcher.signal });
        watchers.set(el, watcher);
    }

    if (!el.open) {
        el.showModal();
    }
}

export function dialogClose(el) {
    if (el?.open) {
        el.close();
    }
}

export function dialogFree(el) {
    if (!el) {
        return;
    }

    watchers.get(el)?.abort();
    watchers.delete(el);
}
