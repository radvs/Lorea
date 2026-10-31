const LIST = '.os-tablist';
const TAB = '[role="tab"]';

let wired = false;

export function tabsWire() {
    if (wired) {
        return;
    }

    wired = true;

    document.addEventListener('keydown', (e) => {
        const tab = e.target instanceof Element ? e.target.closest(TAB) : null;
        const list = tab?.closest(LIST);

        if (!list) {
            return;
        }

        const tabs = [...list.querySelectorAll(TAB)].filter(item => !item.matches(':disabled'));
        const at = tabs.indexOf(tab);
        const rtl = getComputedStyle(list).direction === 'rtl';
        let next;

        switch (e.key) {
            case 'ArrowRight':
                next = at + (rtl ? -1 : 1);
                break;
            case 'ArrowLeft':
                next = at + (rtl ? 1 : -1);
                break;
            case 'Home':
                next = 0;
                break;
            case 'End':
                next = tabs.length - 1;
                break;
            default:
                return;
        }

        e.preventDefault();

        const target = tabs[(next + tabs.length) % tabs.length];

        if (target && target !== tab) {
            target.focus();
            target.click();
        }
    });
}
