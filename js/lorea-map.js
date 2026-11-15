// Brings the picked package into view when the wiring diagram is wider than its frame.
export function reveal(id) {
    const node = document.getElementById(id);
    const canvas = node?.closest(".map-canvas");
    if (!node || !canvas || canvas.scrollWidth <= canvas.clientWidth) {
        return;
    }

    const box = node.getBoundingClientRect();
    const view = canvas.getBoundingClientRect();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    canvas.scrollBy({
        left: box.left + box.width / 2 - (view.left + view.width / 2),
        behavior: reduce ? "auto" : "smooth"
    });
}

// Marks the frame while the diagram is wider than the screen, so the scroll hint can show.
let observer;
export function watchOverflow() {
    observer?.disconnect();
    const canvas = document.querySelector(".map-canvas");
    const frame = canvas?.closest(".map-frame");
    if (!canvas || !frame) {
        return;
    }

    const update = () => {
        frame.dataset.overflow = canvas.scrollWidth > canvas.clientWidth + 1 ? "true" : "false";
    };
    observer = new ResizeObserver(update);
    observer.observe(canvas);
    const svg = canvas.querySelector("svg");
    if (svg) {
        observer.observe(svg);
    }
    update();
}

export function unwatch() {
    observer?.disconnect();
    observer = undefined;
}
