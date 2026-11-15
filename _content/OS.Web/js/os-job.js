const STATES = ['idle', 'running', 'done', 'failed', 'cancelled'];
const MIN = 500;
const MAX = 60000;

export function jobWire(root) {
    if (!root || root.dataset.wired === 'true') {
        return;
    }

    root.dataset.wired = 'true';

    const own = location.origin;
    const words = parse(root.dataset.words);
    const interval = Math.min(Math.max(Number(root.dataset.interval) || 1500, MIN), MAX);
    const watcher = new AbortController();
    const { signal } = watcher;

    const run = root.querySelector('.os-job-run');
    const line = root.querySelector('[data-job-line]');
    const percent = root.querySelector('[data-job-percent]');
    const track = root.querySelector('[data-job-track]');
    const done = root.querySelector('[data-job-done]');
    const elapsed = root.querySelector('[data-job-elapsed]');
    const remaining = root.querySelector('[data-job-remaining]');
    const note = root.querySelector('[data-job-note]');
    const start = root.querySelector('[data-job-start]');
    const stop = root.querySelector('[data-job-stop]');

    let timer = 0;
    let state = 'idle';

    function parse(text) {
        try {
            return JSON.parse(text || '{}');
        } catch {
            return {};
        }
    }

    function local(url) {
        try {
            return !!url && new URL(url, location.href).origin === own;
        } catch {
            return false;
        }
    }

    function fill(text, ...values) {
        return values.reduce((result, value, at) => result.replace(`{${at}}`, value), text || '');
    }

    function clock(seconds) {
        const total = Math.max(0, Math.floor(Number(seconds) || 0));
        const minutes = Math.floor(total / 60);

        return `${minutes}:${String(total % 60).padStart(2, '0')}`;
    }

    function left(value) {
        if (value === null || value === undefined) {
            return words.unknown || '';
        }

        if (value < 60) {
            return fill(words.seconds, Math.max(1, Math.ceil(value)));
        }

        return fill(words.about, fill(words.minutes, Math.ceil(value / 60)));
    }

    function normal(value) {
        if (typeof value === 'number') {
            return STATES[value] || 'idle';
        }

        const text = String(value || '').toLowerCase();

        return STATES.includes(text) ? text : 'idle';
    }

    function show(element, visible) {
        if (element) {
            element.hidden = !visible;
        }
    }

    function say(text) {
        if (note) {
            note.textContent = text || '';
            note.hidden = !text;
        }
    }

    async function call(url, method) {
        if (!local(url)) {
            throw new Error('url');
        }

        const headers = { Accept: 'application/json' };

        if (method !== 'GET' && root.dataset.token) {
            headers[root.dataset.tokenHeader || 'RequestVerificationToken'] = root.dataset.token;
        }

        const response = await fetch(url, { method, headers, credentials: 'same-origin', signal });
        const body = await response.json().catch(() => null);

        if (!body) {
            throw new Error('body');
        }

        return body.data ?? body;
    }

    function render(status) {
        state = normal(status.state);
        root.dataset.state = state;

        const total = Number(status.total) || 0;
        const count = Number(status.done) || 0;
        const share = total > 0 ? Math.round(count * 100 / total) : 0;
        const phases = Number(status.phaseCount) || 0;
        const running = state === 'running';

        show(run, running || state === 'done');
        show(start, state !== 'running');
        show(stop, running);

        if (line) {
            line.textContent = status.phaseName || (phases > 1 ? fill(words.phase, status.phase, phases) : '');
        }

        if (percent) {
            percent.textContent = `${share}%`;
        }

        if (track) {
            track.setAttribute('aria-valuemax', String(total));
            track.setAttribute('aria-valuenow', String(count));
            track.querySelector('i')?.style.setProperty('--os-job-p', `${share}%`);
        }

        if (done) {
            done.textContent = fill(words.of, count, total);
        }

        if (elapsed) {
            elapsed.textContent = clock(status.elapsed);
        }

        if (remaining) {
            remaining.textContent = left(status.remaining);
        }

        if (state === 'failed') {
            say(`${words.failed || ''} ${status.message || ''}`.trim());
        } else if (state === 'cancelled') {
            say(words.stopped || '');
        } else {
            say(state === 'done' ? status.message : '');
        }
    }

    function later() {
        clearTimeout(timer);

        if (state === 'running' && !document.hidden) {
            timer = setTimeout(poll, interval);
        }
    }

    async function poll() {
        try {
            render(await call(root.dataset.status, 'GET'));
        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }

            say(words.lost);
        }

        later();
    }

    async function act(url, method) {
        try {
            render(await call(url, method));
        } catch (error) {
            if (error.name !== 'AbortError') {
                say(words.lost);
            }
        }

        later();
    }

    start?.addEventListener('click', () => act(root.dataset.start, 'POST'), { signal });
    stop?.addEventListener('click', () => act(root.dataset.stop, 'DELETE'), { signal });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearTimeout(timer);
        } else if (state === 'running') {
            poll();
        }
    }, { signal });

    addEventListener('pagehide', () => {
        clearTimeout(timer);
        watcher.abort();
    }, { once: true });

    addEventListener('pageshow', (event) => {
        if (event.persisted) {
            delete root.dataset.wired;
            jobWire(root);
        }
    }, { once: true });

    poll();
}
