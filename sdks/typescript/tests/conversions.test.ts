import assert from 'node:assert/strict'
import test from 'node:test'
import { TOOL_METHODS } from '../src/generated-tools.js'
import { Client } from '../src/index.js'

const jobResponse = {
  id: 'job_123',
  tool_name: 'pdf-to-word',
  tool_version: '1.0.0',
  status: 'QUEUED',
  progress: 0,
  input_filename: 'document.pdf',
  output_filename: null,
  output_url: null,
  error: null,
  created_at: '2026-09-13T10:00:00Z',
  started_at: null,
  completed_at: null,
}

test('conversion shortcuts delegate to jobs.create with the registered tool', async () => {
  const originalFetch = globalThis.fetch
  let submittedForm: FormData | undefined
  let submittedKey: string | null = null
  let submittedURL = ''
  globalThis.fetch = async (input, init) => {
    submittedURL = String(input)
    submittedForm = init?.body as FormData
    submittedKey = new Headers(init?.headers).get('idempotency-key')
    return new Response(JSON.stringify(jobResponse), {
      status: 202,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    const client = new Client({ apiKey: 'key', baseURL: 'https://api.test' })
    const job = await client.convert.pdf_to_word(Buffer.from('pdf'), {
      filename: 'document.pdf',
      options: { preserveLayout: true },
      idempotencyKey: 'operation-123',
    })

    assert.equal(job.id, 'job_123')
    assert.equal(submittedURL, 'https://api.test/v1/tools/pdf-to-word/jobs')
    assert.equal(submittedForm?.get('options'), '{"preserveLayout":true}')
    assert.equal((submittedForm?.get('file') as File).name, 'document.pdf')
    assert.equal(submittedKey, 'operation-123')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('all generated tool shortcuts are exposed as typed functions', () => {
  const client = new Client({ apiKey: 'key', baseURL: 'https://api.test' })

  assert.equal(Object.keys(client.convert).length, TOOL_METHODS.length)
  assert.ok(Object.values(client.convert).every((conversion) => typeof conversion === 'function'))
  assert.equal(typeof client.convert.avif_to_webp, 'function')
  assert.equal(typeof client.convert.pdf_to_word, 'function')
  assert.equal(typeof client.convert.webp_to_avif, 'function')
  assert.equal(typeof client.convert.word_to_text, 'function')
  assert.ok(Object.isFrozen(client.convert))
})
