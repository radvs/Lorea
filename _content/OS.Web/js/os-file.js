// Hands a generated file to the browser as a download. The name and the text arrive as
// separate arguments so a caller can build a whole file without leaving Blazor, and the
// object URL is released as soon as the click has been handled so a long session does not
// pile up blobs.
export function downloadText(name, text, mime) {
    const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    try {
        const link = document.createElement('a');
        link.href = url;
        link.download = name || 'download';
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        link.remove();
    } finally {
        // Revoked on the next turn: revoking synchronously can cancel the download in some
        // browsers, because the click has not been read yet.
        setTimeout(() => URL.revokeObjectURL(url), 0);
    }
}

// The grid's own CSV shape: comma separated, every field quoted, so a value holding a comma,
// a quote or a newline survives a round trip through a spreadsheet.
export function downloadCsv(name, rows) {
    const body = rows
        .map((row) => row.map((cell) => `"${`${cell ?? ''}`.replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

    downloadText(name, `\uFEFF${body}\r\n`, 'text/csv;charset=utf-8');
}
