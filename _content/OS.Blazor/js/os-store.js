function area(name) {
    return name === "session" ? sessionStorage : localStorage;
}

export function storeGet(key, name) {
    try {
        return area(name).getItem(key);
    } catch {
        return null;
    }
}

export function storeSet(key, value, name) {
    try {
        area(name).setItem(key, value);
        return true;
    } catch {
        return false;
    }
}

export function storeRemove(key, name) {
    try {
        area(name).removeItem(key);
        return true;
    } catch {
        return false;
    }
}
