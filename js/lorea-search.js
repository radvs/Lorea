// Ctrl K (or Cmd K) opens the search from anywhere on the page.
let unwatchSearchKey = () => {};

export function watchSearchKey(ref) {
    unwatchSearchKey();

    function onKey(event) {
        if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) {
            return;
        }

        if (event.code === "KeyK" || event.key.toLowerCase() === "k") {
            event.preventDefault();
            ref.invokeMethodAsync("OpenFromKeyboard");
        }
    }

    document.addEventListener("keydown", onKey);
    unwatchSearchKey = () => document.removeEventListener("keydown", onKey);
}

export function stopSearchKey() {
    unwatchSearchKey();
    unwatchSearchKey = () => {};
}
