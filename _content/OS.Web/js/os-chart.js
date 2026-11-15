const HOST = '[data-chart-tip]';
const ROOT = '[data-os-chart]';
const MAX_ROWS = 24;

let wired = false;
let current = null;

export function chartWire() {
    if (wired) {
        return;
    }

    wired = true;

    document.addEventListener('pointerover', (e) => {
        if (e.pointerType !== 'touch') {
            show(hostOf(e.target), e.clientX, e.clientY, false);
        }
    }, true);

    document.addEventListener('pointermove', (e) => {
        if (current && e.pointerType !== 'touch') {
            place(current.tip, e.clientX, e.clientY, false);
        }
    }, true);

    document.addEventListener('pointerout', (e) => {
        if (current && !current.host.contains(e.relatedTarget)) {
            hide();
        }
    }, true);

    document.addEventListener('focusin', (e) => show(hostOf(e.target), 0, 0, true), true);

    document.addEventListener('focusout', (e) => {
        if (current && !current.host.contains(e.relatedTarget)) {
            hide();
        }
    }, true);

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

function rowsOf(host) {
    if (host.dataset.tipRows) {
        try {
            const rows = JSON.parse(host.dataset.tipRows);

            return Array.isArray(rows) ? rows.slice(0, MAX_ROWS) : [];
        } catch {
            return [];
        }
    }

    return [{ label: host.dataset.tipLabel, text: host.dataset.tipText, color: host.dataset.tipColor }];
}

function safeColor(value) {
    return value && CSS.supports('color', value) ? value : 'currentColor';
}

function span(className, text) {
    const node = document.createElement('span');

    node.className = className;
    node.textContent = text ?? '';

    return node;
}

function build(tip, host) {
    tip.replaceChildren();

    if (host.dataset.tipHead) {
        tip.append(span('os-chart-tip-head', host.dataset.tipHead));
    }

    for (const row of rowsOf(host)) {
        const line = document.createElement('span');
        const mark = span('os-chart-mark', '');

        mark.style.setProperty('--os-chart-mark', safeColor(row.color));
        line.className = 'os-chart-tip-row';
        line.append(mark, span('os-chart-tip-name', row.label), span('os-chart-tip-num', row.text));
        tip.append(line);
    }
}

function tipOf(root) {
    let tip = root.querySelector(':scope > .os-chart-tip');

    if (!tip) {
        tip = document.createElement('div');
        tip.className = 'os-chart-tip';
        tip.setAttribute('role', 'status');
        tip.hidden = true;
        root.append(tip);
    }

    return tip;
}

function place(tip, x, y, docked) {
    tip.dataset.dock = docked ? 'true' : 'false';
    tip.style.setProperty('--os-chart-x', `${x}px`);
    tip.style.setProperty('--os-chart-y', `${y}px`);
}

function show(host, x, y, docked) {
    if (!host) {
        return;
    }

    const root = host.closest(ROOT);

    if (!root) {
        return;
    }

    if (current && current.host !== host) {
        hide();
    }

    const tip = tipOf(root);

    build(tip, host);
    place(tip, x, y, docked);
    tip.hidden = false;
    current = { host, tip };
}

function hide() {
    if (current) {
        current.tip.hidden = true;
        current = null;
    }
}
