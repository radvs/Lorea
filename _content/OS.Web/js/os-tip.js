import { MARGIN, clampToView } from './os-place.js';

const GAP = 6;
const HOST = '.os-tip[data-os-tip]';
const OPPOSITE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

let wired = false;
let bubble = null;
let current = null;
let watcher = null;

export function tipWire() {
    if (wired) {
        return;
    }

    wired = true;

    document.addEventListener('pointerover', (e) => {
        if (e.pointerType !== 'touch') {
            show(hostOf(e.target));
        }
    }, true);

    document.addEventListener('pointerout', (e) => {
        if (current && !current.contains(e.relatedTarget)) {
            hide();
        }
    }, true);

    document.addEventListener('focusin', (e) => show(hostOf(e.target)), true);

    document.addEventListener('focusout', (e) => {
        if (current && !current.contains(e.relatedTarget)) {
            hide();
        }
    }, true);

    document.addEventListener('pointerdown', hide, true);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hide();
        }
    }, true);

    window.addEventListener('scroll', hide, { capture: true, passive: true });
    window.addEventListener('resize', hide);
}

function hostOf(target) {
    return target instanceof Element ? target.closest(HOST) : null;
}

function ensureBubble() {
    if (bubble?.isConnected) {
        return bubble;
    }

    bubble = document.createElement('div');
    bubble.className = 'os-tip-bubble';
    bubble.setAttribute('popover', 'manual');
    bubble.setAttribute('role', 'tooltip');

    document.body.appendChild(bubble);

    return bubble;
}

function show(host) {
    if (!host) {
        return;
    }

    if (host === current) {
        return;
    }

    const text = host.dataset.osTip;

    if (!text) {
        hide();
        return;
    }

    const tip = ensureBubble();

    current = host;
    tip.textContent = text;
    tip.style.left = '0px';
    tip.style.top = '0px';

    if (!tip.matches(':popover-open')) {
        tip.showPopover();
    }

    place(host, tip);
    watch(host);
}

function hide() {
    watcher?.disconnect();
    watcher = null;
    current = null;

    if (bubble?.matches(':popover-open')) {
        bubble.hidePopover();
    }
}

function watch(host) {
    watcher?.disconnect();

    watcher = new MutationObserver(() => {
        if (!host.isConnected || !host.hasAttribute('data-os-tip')) {
            hide();
        }
    });

    watcher.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-os-tip'] });
}

function place(host, tip) {
    const rect = host.getBoundingClientRect();
    const size = tip.getBoundingClientRect();
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const rtl = getComputedStyle(host).direction === 'rtl';

    let side = host.dataset.at || 'top';

    if (side === 'start') {
        side = rtl ? 'right' : 'left';
    } else if (side === 'end') {
        side = rtl ? 'left' : 'right';
    }

    const room = {
        top: rect.top - MARGIN,
        bottom: height - rect.bottom - MARGIN,
        left: rect.left - MARGIN,
        right: width - rect.right - MARGIN
    };

    const need = {
        top: size.height + GAP,
        bottom: size.height + GAP,
        left: size.width + GAP,
        right: size.width + GAP
    };

    if (room[side] < need[side] && room[OPPOSITE[side]] >= need[OPPOSITE[side]]) {
        side = OPPOSITE[side];
    }

    let x;
    let y;

    if (side === 'top' || side === 'bottom') {
        x = rect.left + rect.width / 2 - size.width / 2;
        y = side === 'top' ? rect.top - size.height - GAP : rect.bottom + GAP;
    } else {
        y = rect.top + rect.height / 2 - size.height / 2;
        x = side === 'left' ? rect.left - size.width - GAP : rect.right + GAP;
    }

    tip.style.left = `${clampToView(x, size.width, width)}px`;
    tip.style.top = `${clampToView(y, size.height, height)}px`;
}
