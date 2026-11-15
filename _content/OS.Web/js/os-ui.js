(function () {
    if (globalThis.__osUi)
        return;

    globalThis.__osUi = true;

    var YEAR = 31536000;
    var NAME = /^[\w.-]{1,64}$/;
    var dark = matchMedia('(prefers-color-scheme: dark)');
    var script = document.currentScript;
    var base = script && script.src ? script.src.slice(0, script.src.lastIndexOf('/') + 1) : '';
    var quiet = { invokeMethodAsync: function () { return Promise.resolve(); } };

    function shellOf(node) {
        return node.closest('[data-os-shell]');
    }

    function all(shell, selector) {
        return shell.querySelectorAll(selector);
    }

    function remember(key, value) {
        if (!key || !NAME.test(key))
            return;

        var cookie = key + '=' + value + '; path=/; max-age=' + YEAR + '; samesite=lax';

        if (location.protocol === 'https:')
            cookie += '; secure';

        document.cookie = cookie;
    }

    function setRail(shell, open) {
        shell.dataset.rail = open ? 'open' : 'closed';

        var label = open ? shell.dataset.closeLabel : shell.dataset.openLabel;

        all(shell, '[data-os-rail-toggle]').forEach(function (button) {
            button.setAttribute('aria-expanded', open ? 'true' : 'false');

            if (label)
                button.setAttribute('aria-label', label);
        });

        remember(shell.dataset.key, open ? 'open' : 'closed');
    }

    function setDrawer(shell, open, focus) {
        var wasOpen = shell.dataset.drawer === 'open';

        if (wasOpen === open)
            return;

        shell.dataset.drawer = open ? 'open' : 'closed';

        var label = open ? shell.dataset.closeLabel : shell.dataset.openLabel;
        var toggles = all(shell, '[data-os-drawer-toggle]');

        toggles.forEach(function (button) {
            button.setAttribute('aria-expanded', open ? 'true' : 'false');

            if (label && button.classList.contains('os-shell-menu'))
                button.setAttribute('aria-label', label);
        });

        if (!focus)
            return;

        if (open) {
            var rail = shell.querySelector('.os-shell-rail');

            if (rail)
                rail.focus();
        } else {
            var more = shell.querySelector('.os-shell-tab-more');
            var menu = shell.querySelector('.os-shell-menu-drawer');
            var target = more && more.offsetParent !== null ? more : menu;

            if (target)
                target.focus();
        }
    }

    function stored(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    function save(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
        }
    }

    function modeOf(button) {
        var value = stored(button.dataset.key);

        return value === 'dark' || value === 'light' ? value : 'system';
    }

    function isDark(button) {
        return document.documentElement.getAttribute(button.dataset.attr) === button.dataset.dark;
    }

    function apply(button, mode) {
        var useDark = mode === 'dark' || (mode === 'system' && dark.matches);
        var root = document.documentElement;

        root.setAttribute(button.dataset.attr, useDark ? button.dataset.dark : button.dataset.light);
        root.style.colorScheme = useDark ? 'dark' : 'light';
    }

    function nextOf(button, mode) {
        if (button.dataset.system === 'on')
            return mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';

        return isDark(button) ? 'light' : 'dark';
    }

    function labelOf(button, mode) {
        return button.dataset[mode + 'Label'] || '';
    }

    function sync(button) {
        var mode = modeOf(button);
        var next = nextOf(button, mode);
        var label = labelOf(button, next);

        button.dataset.mode = mode;
        button.dataset.dest = button.dataset.system === 'on' ? mode : next;

        if (label) {
            button.setAttribute('aria-label', label);
            button.setAttribute('title', label);
        }
    }

    function syncAll() {
        document.querySelectorAll('[data-os-theme-toggle]').forEach(sync);
    }

    function toggleTheme(button) {
        var next = nextOf(button, modeOf(button));

        save(button.dataset.key, next);
        apply(button, next);
        syncAll();
    }

    function pickTab(tab) {
        var list = tab.closest('.os-tablist');

        if (!list)
            return;

        list.querySelectorAll('[role="tab"]').forEach(function (item) {
            var on = item === tab;
            var panel = item.getAttribute('aria-controls');

            item.setAttribute('aria-selected', on ? 'true' : 'false');
            item.setAttribute('tabindex', on ? '0' : '-1');

            if (panel) {
                var node = document.getElementById(panel);

                if (node)
                    node.hidden = !on;
            }
        });
    }

    function syncTabs() {
        document.querySelectorAll('[data-os-tabs]').forEach(function (list) {
            var tab = list.querySelector('[data-os-tab][aria-selected="true"]');

            if (tab)
                pickTab(tab);
        });
    }

    function setAccordion(item, open) {
        var body = item.querySelector('.os-acc-body');
        var button = item.querySelector('[data-os-acc-toggle]');

        if (open)
            item.dataset.open = 'true';
        else
            delete item.dataset.open;

        if (body) {
            if (open)
                body.dataset.open = 'true';
            else
                delete body.dataset.open;

            body.inert = !open;
        }

        if (button)
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function toggleAccordion(button) {
        var item = button.closest('.os-acc-item');
        var host = button.closest('[data-os-acc]');

        if (!item || !host)
            return;

        var open = item.dataset.open !== 'true';

        if (open && host.dataset.multiple !== 'true') {
            host.querySelectorAll('.os-acc-item').forEach(function (other) {
                if (other !== item && other.closest('[data-os-acc]') === host)
                    setAccordion(other, false);
            });
        }

        setAccordion(item, open);
    }

    function toggleTree(button) {
        var item = button.closest('.os-tree-item');
        var kids = item ? item.querySelector(':scope > .os-tree-kids') : null;

        if (!item || !kids)
            return;

        var open = kids.hidden;
        var label = open ? button.dataset.shutLabel : button.dataset.openLabel;

        kids.hidden = !open;
        item.setAttribute('aria-expanded', open ? 'true' : 'false');

        if (open)
            button.dataset.open = 'true';
        else
            delete button.dataset.open;

        if (label) {
            button.setAttribute('aria-label', label);
            button.setAttribute('title', label);
        }
    }

    function selectOption(option) {
        var host = option.closest('[data-os-dropdown]');

        if (!host)
            return;

        var input = host.querySelector('[data-os-dropdown-input]');
        var value = host.querySelector('[data-os-dropdown-value]');
        var panel = option.closest('[popover]');
        var trigger = host.querySelector('.os-dropdown-trigger');
        var text = option.querySelector('.os-dropdown-option-text');

        if (input) {
            input.value = option.dataset.value || '';
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (value) {
            value.textContent = text ? text.textContent.trim() : '';
            delete value.dataset.empty;
        }

        host.querySelectorAll('[data-os-dropdown-option]').forEach(function (item) {
            item.setAttribute('aria-selected', item === option ? 'true' : 'false');
        });

        if (panel && panel.matches(':popover-open'))
            panel.hidePopover();

        if (trigger)
            trigger.focus();
    }

    function lazy(name, ready) {
        if (!base)
            return;

        import(base + name).then(ready).catch(function () {
        });
    }

    function startToasts() {
        document.querySelectorAll('.os-toast[data-duration]').forEach(function (toast) {
            var span = Number(toast.dataset.duration);

            if (span > 0)
                setTimeout(function () { toast.remove(); }, span);
        });
    }

    function startOptional() {
        document.querySelectorAll('dialog[data-os-open="true"]').forEach(function (dialog) {
            if (!dialog.open && dialog.showModal)
                dialog.showModal();
        });

        if (document.querySelector('.os-menu-panel'))
            lazy('os-menu.js', function (module) { module.menuWire(); });

        if (document.querySelector('[data-os-tip]'))
            lazy('os-tip.js', function (module) { module.tipWire(); });

        var dropdowns = document.querySelectorAll('[data-os-dropdown]');

        if (dropdowns.length > 0) {
            lazy('os-dropdown.js', function (module) {
                dropdowns.forEach(function (host) {
                    var panel = host.querySelector('.os-dropdown-panel');
                    var trigger = host.querySelector('.os-dropdown-trigger');

                    if (panel)
                        module.dropdownWire(panel, trigger, quiet);
                });
            });
        }

        if (document.querySelector('[data-chart-tip]'))
            lazy('os-chart.js', function (module) { module.chartWire(); });

        if (document.querySelector('[data-os-job]')) {
            lazy('os-job.js', function (module) {
                document.querySelectorAll('[data-os-job]').forEach(module.jobWire);
            });
        }

        startToasts();
    }

    document.addEventListener('click', function (event) {
        var target = event.target;

        if (!(target instanceof Element))
            return;

        var option = target.closest('[data-os-dropdown-option]');

        if (option) {
            if (!option.disabled)
                selectOption(option);

            return;
        }

        var opener = target.closest('[data-os-dialog-open]');

        if (opener) {
            var dialog = document.getElementById(opener.dataset.osDialogOpen);

            if (dialog && dialog.showModal && !dialog.open)
                dialog.showModal();

            return;
        }

        var closer = target.closest('[data-os-dialog-close]');

        if (closer) {
            var owner = closer.closest('dialog');

            if (owner && owner.open)
                owner.close();

            return;
        }

        var toast = target.closest('[data-os-toast-close]');

        if (toast) {
            var item = toast.closest('.os-toast');

            if (item)
                item.remove();

            return;
        }

        var tab = target.closest('[data-os-tab]');

        if (tab) {
            pickTab(tab);

            return;
        }

        var acc = target.closest('[data-os-acc-toggle]');

        if (acc) {
            toggleAccordion(acc);

            return;
        }

        var tree = target.closest('[data-os-tree-toggle]');

        if (tree) {
            toggleTree(tree);

            return;
        }

        var rail = target.closest('[data-os-rail-toggle]');

        if (rail) {
            var shell = shellOf(rail);

            if (shell)
                setRail(shell, shell.dataset.rail !== 'open');

            return;
        }

        var drawer = target.closest('[data-os-drawer-toggle]');

        if (drawer) {
            var owner = shellOf(drawer);

            if (owner)
                setDrawer(owner, owner.dataset.drawer !== 'open', true);

            return;
        }

        var veil = target.closest('[data-os-drawer-close]');

        if (veil) {
            var host = shellOf(veil);

            if (host)
                setDrawer(host, false, true);

            return;
        }

        var theme = target.closest('[data-os-theme-toggle]');

        if (theme)
            toggleTheme(theme);
    });

    document.addEventListener('keydown', function (event) {
        if (!(event.target instanceof Element))
            return;

        var current = event.target.closest('[data-os-tab]');
        var list = current ? current.closest('.os-tablist') : null;

        if (list) {
            var tabs = Array.prototype.filter.call(list.querySelectorAll('[data-os-tab]'), function (item) {
                return !item.disabled;
            });
            var at = tabs.indexOf(current);
            var rtl = getComputedStyle(list).direction === 'rtl';
            var next = -1;

            if (event.key === 'ArrowRight')
                next = at + (rtl ? -1 : 1);
            else if (event.key === 'ArrowLeft')
                next = at + (rtl ? 1 : -1);
            else if (event.key === 'Home')
                next = 0;
            else if (event.key === 'End')
                next = tabs.length - 1;

            if (next >= 0 || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();

                var target = tabs[(next + tabs.length) % tabs.length];

                if (target && target !== current) {
                    target.focus();
                    pickTab(target);
                }
            }

            return;
        }

        if (event.key !== 'Escape')
            return;

        var shell = shellOf(event.target);

        if (shell && shell.dataset.drawer === 'open')
            setDrawer(shell, false, true);
    });

    document.addEventListener('change', function (event) {
        var target = event.target;

        if (target instanceof HTMLSelectElement && target.hasAttribute('data-os-autosubmit') && target.form)
            target.form.requestSubmit();
    });

    dark.addEventListener('change', function () {
        document.querySelectorAll('[data-os-theme-toggle]').forEach(function (button) {
            if (modeOf(button) === 'system')
                apply(button, 'system');
        });

        syncAll();
    });

    syncAll();
    syncTabs();
    startOptional();
})();
