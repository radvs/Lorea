// A language change rebuilds the page; the browser may clamp the scroll position to the top while it is short.
export function holdScroll() {
    const top = window.scrollY;
    const until = performance.now() + 1500;
    const events = ["wheel", "touchstart", "keydown", "pointerdown"];

    function release() {
        for (const name of events) {
            window.removeEventListener(name, release);
        }
        stop = true;
    }

    let stop = false;
    for (const name of events) {
        window.addEventListener(name, release, { passive: true, once: true });
    }

    function step() {
        if (stop) {
            return;
        }

        const reachable = document.documentElement.scrollHeight - window.innerHeight >= top;
        if (reachable && Math.abs(window.scrollY - top) > 1) {
            window.scrollTo({ top, behavior: "instant" });
        }

        if (performance.now() < until) {
            requestAnimationFrame(step);
        } else {
            release();
        }
    }

    requestAnimationFrame(step);
}

// A code block that scrolls sideways needs to be reachable with the keyboard too.
let unwatch = null;

export function watchScrollers() {
    if (unwatch) {
        return;
    }

    const root = document.getElementById("main-content") ?? document.body;
    let frame = 0;

    function mark() {
        frame = 0;
        for (const pre of root.querySelectorAll(".os-code-box pre")) {
            if (pre.scrollWidth > pre.clientWidth + 1) {
                pre.tabIndex = 0;
            } else {
                pre.removeAttribute("tabindex");
            }
        }
    }

    function schedule() {
        if (frame === 0) {
            frame = requestAnimationFrame(mark);
        }
    }

    const observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true });
    window.addEventListener("resize", schedule);
    mark();

    unwatch = () => {
        observer.disconnect();
        window.removeEventListener("resize", schedule);
        if (frame !== 0) {
            cancelAnimationFrame(frame);
        }
        frame = 0;
    };
}

// A link from the glance to a sample moves the page through the router, so :target never matches. Mark the sample ourselves.
let unwatchTargets = null;

export function watchGlanceLinks() {
    if (unwatchTargets) {
        return;
    }

    function onClick(event) {
        const link = event.target.closest?.(".glance-link");
        const id = link?.getAttribute("href")?.split("#")[1];
        if (!id) {
            return;
        }

        for (const card of document.querySelectorAll(".is-target")) {
            card.classList.remove("is-target");
        }

        requestAnimationFrame(() => document.getElementById(id)?.classList.add("is-target"));
    }

    document.addEventListener("click", onClick);
    unwatchTargets = () => document.removeEventListener("click", onClick);
}
