import * as store from './os-store.js';
import * as clipboard from './os-clipboard.js';
import * as file from './os-file.js';
import * as theme from './os-theme.js';
import * as dialog from './os-dialog.js';
import * as dropdown from './os-dropdown.js';
import * as menu from './os-menu.js';
import * as tabs from './os-tabs.js';
import * as totop from './os-totop.js';
import * as tip from './os-tip.js';
import * as accordion from './os-accordion.js';
import * as connection from './os-connection.js';

export * from './os-store.js';
export * from './os-clipboard.js';
export * from './os-file.js';
export * from './os-theme.js';
export * from './os-dialog.js';
export * from './os-dropdown.js';
export * from './os-menu.js';
export * from './os-tabs.js';
export * from './os-totop.js';
export * from './os-tip.js';
export * from './os-accordion.js';
export * from './os-connection.js';

globalThis.osWeb = {
    ...store,
    ...clipboard,
    ...file,
    ...theme,
    ...dialog,
    ...dropdown,
    ...menu,
    ...tabs,
    ...totop,
    ...tip,
    ...accordion,
    ...connection,
};
