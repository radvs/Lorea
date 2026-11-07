let detach = () => {};

export function watchHomeViews() {
    detach();

    const explorer = document.querySelector(".home-explorer");
    if (!explorer) {
        return;
    }

    const viewLinks = Array.from(document.querySelectorAll(".view-mode"));
    const phone = window.matchMedia("(max-width: 63.99rem)");

    function setView(view) {
        if (view !== "map" && view !== "packages") {
            return;
        }

        // The map needs room; a phone always gets the list.
        if (view === "map" && phone.matches) {
            view = "packages";
        }

        explorer.dataset.view = view;
        for (const link of viewLinks) {
            if (link.hash === `#${view}`) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        }
    }

    // A phone starts on the grouped list; the map stays one tap away.
    function defaultView() {
        return phone.matches ? "packages" : "map";
    }

    function onClick(event) {
        if (!(event.target instanceof Element)) {
            return;
        }

        const link = event.target.closest("a[href]");
        if (!link) {
            return;
        }

        const target = new URL(link.href, location.href);
        if (target.origin !== location.origin || target.pathname !== location.pathname) {
            return;
        }

        const view = target.hash.slice(1);
        if (view !== "map" && view !== "packages") {
            return;
        }

        event.preventDefault();
        if (location.hash !== target.hash) {
            history.pushState(null, "", `${location.pathname}${target.hash}`);
        }
        setView(view);
    }

    function onHistoryChange() {
        setView(location.hash.slice(1) || defaultView());
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onHistoryChange);
    window.addEventListener("hashchange", onHistoryChange);
    phone.addEventListener("change", onHistoryChange);
    detach = () => {
        document.removeEventListener("click", onClick, true);
        window.removeEventListener("popstate", onHistoryChange);
        window.removeEventListener("hashchange", onHistoryChange);
        phone.removeEventListener("change", onHistoryChange);
    };
    onHistoryChange();
}

export function stopHomeViews() {
    detach();
    detach = () => {};
}
