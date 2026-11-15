// Marks the link whose section the reader is looking at: is-current and aria-current, with is-passed on those above it.
let detach = () => {};

export function spyWire(selector = '[data-toc]', offsetSelector = null, gap = 28) {
    detach();

    const links = Array.from(document.querySelectorAll(selector));
    const sections = links
        .map(link => document.getElementById(link.dataset.toc))
        .filter(Boolean);

    if (sections.length === 0) {
        return;
    }

    const header = offsetSelector ? document.querySelector(offsetSelector) : null;
    const offset = (header?.getBoundingClientRect().height ?? 0) + gap;
    let frame = 0;

    function mark(section) {
        const index = sections.indexOf(section);
        for (const link of links) {
            const current = link.dataset.toc === section.id;
            link.classList.toggle("is-current", current);
            link.classList.toggle("is-passed", sections.indexOf(document.getElementById(link.dataset.toc)) < index);
            if (current) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        }
    }

    function update() {
        frame = 0;

        const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
        if (atEnd) {
            mark(sections[sections.length - 1]);
            return;
        }

        let current = sections[0];
        for (const section of sections) {
            if (section.getBoundingClientRect().top - offset <= 0) {
                current = section;
            }
        }

        mark(current);
    }

    function onScroll() {
        if (frame === 0) {
            frame = requestAnimationFrame(update);
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    detach = () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (frame !== 0) {
            cancelAnimationFrame(frame);
        }
        frame = 0;
    };
}

export function spyFree() {
    detach();
    detach = () => {};
}
