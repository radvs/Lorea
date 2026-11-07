import { clampToView, placeBelowOrAbove } from './os-place.js';

const PANEL = '.os-menu-panel';
const ITEM = '[role="menuitem"]';
const GAP = 4;

let wired = false;
const open = new Set();

export function menuWire() {
    if (wired) {
        return;
    }

    wired = true;

    document.addEventListener('toggle', (e) => {
        const panel = e.target;

        if (!(panel instanceof HTMLElement) || !panel.matches(PANEL)) {
            return;
        }

        const trigger = triggerOf(panel);

        if (e.newState === 'open') {
            open.add(panel);
            trigger?.setAttribute('aria-expanded', 'true');
            place(panel, trigger);
            items(panel)[0]?.focus();
        } else {
            open.delete(panel);
            trigger?.setAttribute('aria-expanded', 'false');
        }
    }, true);

    document.addEventListener('keydown', (e) => {
        const panel = e.target instanceof Element ? e.target.closest(PANEL) : null;

        if (!panel || !open.has(panel)) {
            return;
        }

        const list = items(panel);
        const at = list.indexOf(document.activeElement);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                list[(at + 1) % list.length]?.focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                list[(at - 1 + list.length) % list.length]?.focus();
                break;
            case 'Home':
                e.preventDefault();
                list[0]?.focus();
                break;
            case 'End':
                e.preventDefault();
                list[list.length - 1]?.focus();
                break;
            case 'Tab':
                e.preventDefault();
                close(panel);
                break;
            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                close(panel);
                triggerOf(panel)?.focus();
                break;
        }
    }, true);

    document.addEventListener('click', (e) => {
        const item = e.target instanceof Element ? e.target.closest(ITEM) : null;
        const panel = item?.closest(PANEL);

        if (panel && !item.matches(':disabled')) {
            close(panel);
        }
    });

    document.addEventListener('scroll', (e) => {
        for (const panel of open) {
            if (!panel.contains(e.target)) {
                close(panel);
            }
        }
    }, true);

    window.addEventListener('resize', () => {
        for (const panel of open) {
            close(panel);
        }
    });
}

function close(panel) {
    if (panel.matches(':popover-open')) {
        panel.hidePopover();
    }
}

function items(panel) {
    return [...panel.querySelectorAll(ITEM)].filter(item => !item.matches(':disabled'));
}

function triggerOf(panel) {
    return document.querySelector(`[popovertarget="${CSS.escape(panel.id)}"]`);
}

function place(panel, trigger) {
    if (!trigger) {
        return;
    }

    const rect = trigger.getBoundingClientRect();
    const rtl = getComputedStyle(trigger).direction === 'rtl';
    const width = panel.offsetWidth;
    const start = rtl ? rect.left : rect.right - width;

    panel.style.left = `${clampToView(start, width, window.innerWidth)}px`;
    panel.style.right = 'auto';

    placeBelowOrAbove(panel, rect, GAP);
}
