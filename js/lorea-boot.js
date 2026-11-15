(() => {
    const loading = document.querySelector(".loading");
    if (!loading) {
        return;
    }

    const setState = (state) => {
        if (document.body.contains(loading)) {
            loading.dataset.state = state;
        }
    };
    const timers = [
        setTimeout(() => setState("slow"), 12000),
        setTimeout(() => setState("failed"), 45000)
    ];
    const stop = () => {
        timers.forEach(clearTimeout);
        observer.disconnect();
    };
    const observer = new MutationObserver(() => {
        if (!document.body.contains(loading)) {
            stop();
        }
    });
    observer.observe(document.getElementById("app"), { childList: true });

    window.addEventListener("offline", () => setState("offline"));
    window.addEventListener("online", () => {
        if (loading.dataset.state === "offline") {
            location.reload();
        }
    });
    if (!navigator.onLine) {
        setState("offline");
    }
    document.querySelector('script[src*="blazor.webassembly"]')?.addEventListener("error", () => setState("failed"));
})();
