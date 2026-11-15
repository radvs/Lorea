import { placeBelowOrAbove } from './os-place.js';

const OPTION = '[role="option"], input[type="checkbox"]';
const SEEK_MS = 500;
const GAP = 4;

const watchers = new WeakMap();

export function dropdownWire(panel, trigger, ref) {
    if (!panel || watchers.has(panel)) {
        return;
    }

    const watcher = new AbortController();
    const { signal } = watcher;
    const seeking = { text: '', timer: 0 };
    const single = panel.querySelector('[role="listbox"]') !== null;

    panel.addEventListener('toggle', (e) => {
        const open = e.newState === 'open';

        if (open) {
            place(panel, trigger);
            focusStart(panel);
        }

        ref.invokeMethodAsync('DropdownToggled', open);
    }, { signal });

    trigger?.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') {
            return;
        }

        e.preventDefault();

        if (!panel.matches(':popover-open')) {
            panel.showPopover();
        }
    }, { signal });

    panel.addEventListener('keydown', (e) => {
        const list = options(panel);

        if (list.length === 0) {
            return;
        }

        const at = list.indexOf(document.activeElement);

        switch (e.key) {
            case 'ArrowDown':
                move(e, list, at + 1);
                break;
            case 'ArrowUp':
                move(e, list, at < 0 ? list.length - 1 : at - 1);
                break;
            case 'Home':
                move(e, list, 0);
                break;
            case 'End':
                move(e, list, list.length - 1);
                break;
            case 'Tab':
                if (single) {
                    e.preventDefault();
                    dropdownClose(panel);
                }
                break;
            default:
                seek(e, list, at, seeking);
                break;
        }
    }, { signal });

    signal.addEventListener('abort', () => clearTimeout(seeking.timer));

    window.addEventListener('resize', () => place(panel, trigger), { signal });
    window.addEventListener('scroll', (e) => {
        if (!panel.contains(e.target)) {
            place(panel, trigger);
        }
    }, { signal, capture: true });

    watchers.set(panel, watcher);
}

export function dropdownClose(panel) {
    if (panel?.matches(':popover-open')) {
        panel.hidePopover();
    }
}

export function dropdownFree(panel) {
    if (!panel) {
        return;
    }

    watchers.get(panel)?.abort();
    watchers.delete(panel);
}

function options(panel) {
    return [...panel.querySelectorAll(OPTION)].filter(option => !option.matches(':disabled'));
}

function focusStart(panel) {
    const picked = panel.querySelector('[role="option"][aria-selected="true"]');
    (picked ?? options(panel)[0])?.focus();
}

function move(e, list, index) {
    e.preventDefault();
    list[(index + list.length) % list.length]?.focus();
}

function seek(e, list, at, seeking) {
    if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) {
        return;
    }

    if (e.key === ' ' && seeking.text === '') {
        return;
    }

    e.preventDefault();
    clearTimeout(seeking.timer);

    seeking.text += e.key.toLocaleLowerCase();
    seeking.timer = setTimeout(() => seeking.text = '', SEEK_MS);

    const from = seeking.text.length === 1 ? at + 1 : Math.max(at, 0);
    const ordered = [...list.slice(from), ...list.slice(0, from)];

    ordered.find(option => textOf(option).startsWith(seeking.text))?.focus();
}

function textOf(option) {
    return (option.closest('label') ?? option).textContent.trim().toLocaleLowerCase();
}

function place(panel, trigger) {
    if (!trigger) {
        return;
    }

    const rect = trigger.getBoundingClientRect();
    const rtl = getComputedStyle(trigger).direction === 'rtl';

    panel.style.minWidth = `${rect.width}px`;

    if (rtl) {
        panel.style.right = `${window.innerWidth - rect.right}px`;
        panel.style.left = 'auto';
    } else {
        panel.style.left = `${rect.left}px`;
        panel.style.right = 'auto';
    }

    placeBelowOrAbove(panel, rect, GAP);
}
