// Export CSV compatibile Excel it-IT: separatore ';', quoting RFC4180, CRLF.

export function buildCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (value: string | number): string => {
    const s = String(value);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map(r => r.map(escape).join(';')).join('\r\n');
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  // BOM UTF-8: senza, Excel interpreta il file come ANSI e rompe gli accenti
  const blob = new Blob(['﻿' + buildCsv(headers, rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
