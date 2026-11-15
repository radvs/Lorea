const watchers = new WeakMap();

export function toTopWire(host, target, threshold) {
    if (!host || watchers.has(host)) {
        return;
    }

    const scroller = pick(target);
    const source = scroller === document.scrollingElement ? window : scroller;
    const watcher = new AbortController();
    const { signal } = watcher;

    const sync = () => {
        const room = Math.max(scroller.scrollHeight - scroller.clientHeight, 0);
        const on = Math.min(scroller.scrollTop, room) > threshold ? 'true' : 'false';

        if (host.dataset.on !== on) {
            host.dataset.on = on;
        }
    };

    source.addEventListener('scroll', sync, { signal, passive: true });
    window.addEventListener('resize', sync, { signal, passive: true });

    const sizer = new ResizeObserver(sync);
    sizer.observe(scroller);

    watchers.set(host, { watcher, sizer, scroller });
    sync();
}

export function toTopRise(host, anchor) {
    const state = watchers.get(host);

    if (!state) {
        return;
    }

    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

    state.scroller.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });

    const head = anchor ? state.scroller.querySelector(anchor) : null;

    if (!head) {
        return;
    }

    if (!head.hasAttribute('tabindex')) {
        head.setAttribute('tabindex', '-1');
    }

    head.focus({ preventScroll: true });
}

export function toTopFree(host) {
    const state = watchers.get(host);

    if (!state) {
        return;
    }

    state.watcher.abort();
    state.sizer.disconnect();
    watchers.delete(host);
}

function pick(target) {
    const found = target ? document.querySelector(target) : null;

    return found ?? document.scrollingElement ?? document.documentElement;
}
