export function accordionKeep(id, delay) {
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

    setTimeout(() => {
        const host = document.getElementById(id);

        if (!host || !host.isConnected) {
            return;
        }

        const margin = parseFloat(getComputedStyle(host).scrollMarginTop) || 0;

        if (host.getBoundingClientRect().top >= margin) {
            return;
        }

        host.scrollIntoView({ block: 'start', behavior: calm ? 'auto' : 'smooth' });
    }, calm ? 0 : delay);
}
