// Brings the chapter details into view after a node is picked, but only when they are off screen.
export function showDetail(id) {
    const detail = document.getElementById(id);
    if (!detail) {
        return;
    }

    const top = detail.getBoundingClientRect().top;
    if (top > 0 && top < window.innerHeight - 160) {
        return;
    }

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    detail.scrollIntoView({ block: "start", behavior: calm ? "auto" : "smooth" });
}
