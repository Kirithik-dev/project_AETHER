import test from 'node:test';
import assert from 'node:assert/strict';
import { createPdfFromText, getPdfPageCount } from './pdfEngine';

test('createPdfFromText creates a valid PDF document', async () => {
  const bytes = await createPdfFromText('Test Document', 'Line 1: Hello World\nLine 2: Aether Workspace');
  assert.ok(bytes instanceof Uint8Array);
  assert.ok(bytes.length > 500, 'PDF should have non-trivial byte length');

  // Verify PDF header magic bytes '%PDF-'
  const header = String.fromCharCode(...bytes.slice(0, 5));
  assert.equal(header, '%PDF-');
});

test('getPdfPageCount accurately counts pages of a synthesized PDF', async () => {
  const bytes = await createPdfFromText('Page Count Check', 'Content body');
  const file = new File([bytes as any], 'test.pdf', { type: 'application/pdf' });
  const count = await getPdfPageCount(file);
  assert.equal(count, 1);
});
