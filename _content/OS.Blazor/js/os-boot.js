(function () {
    var tag = document.currentScript;

    if (!tag)
        return;

    var key = tag.dataset.key;
    var dark = tag.dataset.dark;
    var light = tag.dataset.light;
    var attr = tag.dataset.attr || 'data-theme';

    if (!key || !dark || !light)
        return;

    var stored = null;

    try {
        stored = localStorage.getItem(key);
    } catch (e) {
        stored = null;
    }

    var isDark = stored === 'dark'
        || (stored !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);

    var root = document.documentElement;

    root.setAttribute(attr, isDark ? dark : light);
    root.style.colorScheme = isDark ? 'dark' : 'light';
})();
