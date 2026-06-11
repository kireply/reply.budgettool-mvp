import { describe, it, expect } from 'vitest';
import { buildCsv } from './csv';

describe('buildCsv', () => {
  it('should usare ; come separatore (Excel it-IT) e CRLF come fine riga', () => {
    expect(buildCsv(['Codice', 'Budget'], [['IT-2026-001', 480000]]))
      .toBe('Codice;Budget\r\nIT-2026-001;480000');
  });

  it('should quotare i valori contenenti separatore, virgolette o newline', () => {
    expect(buildCsv(['x'], [['a;b']])).toBe('x\r\n"a;b"');
    expect(buildCsv(['x'], [['dice "ciao"']])).toBe('x\r\n"dice ""ciao"""');
    expect(buildCsv(['x'], [['riga1\nriga2']])).toBe('x\r\n"riga1\nriga2"');
  });

  it('should gestire righe multiple e valori numerici', () => {
    expect(buildCsv(['a', 'b'], [[1, 2], [3, 4]])).toBe('a;b\r\n1;2\r\n3;4');
  });
});
