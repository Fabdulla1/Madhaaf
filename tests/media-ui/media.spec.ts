import { expect, test, type Page } from '@playwright/test'
import { testSessionCookie } from './session'

const personId = '22222222-2222-4222-8222-222222222222'
const mediaId = '33333333-3333-4333-8333-333333333333'
const storyId = '44444444-4444-4444-8444-444444444444'
const intentId = '55555555-5555-4555-8555-555555555555'
const person = { id: personId, preferred_name: 'Amina Abdulla', living_status: 'living', status: 'draft', visibility: 'private', birthplace: 'Mombasa', birth_date_text: '1980' }
const video = {
  id: mediaId, kind: 'video', title: 'Family interview', subject_description: 'A private oral history interview with Amina.',
  original_name: 'interview.mp4', mime_type: 'video/mp4', bytes: 1024,
  captured_on: null, location: null, alt_text: null, caption: null, speaker_name: null, attribution: null,
  consent_confirmed: true, public_approved: false, version: 1,
  member_ids: [personId], article_ids: [], is_family_media: true, is_public: false,
  member_media: [{ member_id: personId, family_members: person }], article_media: [],
  url: '/mock-video.mp4',
}
const file = { name: 'interview.mp4', mimeType: 'video/mp4', buffer: Buffer.alloc(24) }


async function mockLibrary(page: Page, items: object[] = [video]) {
  await page.route('**/api/admin/**', route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/admin/media') return route.fulfill({ json: { data: items, pagination: { page: 1, hasMore: false } } })
    if (path === `/api/admin/media/${mediaId}`) return route.fulfill({ json: { data: video } })
    if (path === '/api/admin/members') return route.fulfill({ json: { data: [person], pagination: { hasMore: false } } })
    if (path === '/api/admin/articles') return route.fulfill({ json: { data: [{ id: storyId, title: 'Community memories', status: 'draft' }], pagination: { hasMore: false } } })
    if (path === '/api/admin/links') return route.fulfill({ json: { data: [] } })
    return route.fulfill({ status: 404, json: { error: `Unmocked admin request: ${path}` } })
  })
  await page.route('**/mock-video.mp4', route => route.fulfill({ contentType: 'video/mp4', body: Buffer.alloc(24) }))
}

async function fillUpload(page: Page) {
  await page.getByLabel('Photo, audio, or video', { exact: true }).setInputFiles(file)
  await page.getByLabel('Title', { exact: true }).fill('New family interview')
  await page.getByLabel('Who or what is in this file?', { exact: false }).fill('An oral history interview recorded with Amina in Mombasa.')
  await page.getByRole('checkbox', { name: 'Consent for private storage has been recorded.' }).check()
}

test.beforeEach(async ({ page }) => { await page.context().addCookies([testSessionCookie()]) })

test('required identity and storage consent precede upload; selected living person survives a failed ticket', async ({ page }) => {
  await mockLibrary(page, [])
  const tickets: Record<string, unknown>[] = []
  await page.route('**/api/admin/media/upload-url', route => {
    tickets.push(route.request().postDataJSON())
    return route.fulfill({ status: 503, json: { error: 'Upload service is temporarily unavailable' } })
  })
  await page.goto('/admin/media')
  await expect(page.getByRole('heading', { name: 'Media library', exact: true })).toBeVisible()
  const uploadButton = page.getByRole('button', { name: 'Upload to private library', exact: true })
  await page.getByLabel('Photo, audio, or video', { exact: true }).setInputFiles(file)
  await uploadButton.evaluate(button => (button as HTMLButtonElement).form?.requestSubmit())
  expect(tickets).toHaveLength(0)
  expect(await page.getByLabel('Title', { exact: true }).evaluate(input => (input as HTMLInputElement).validity.valueMissing)).toBe(true)
  await page.getByLabel('Title', { exact: true }).fill('New family interview')
  await uploadButton.evaluate(button => (button as HTMLButtonElement).form?.requestSubmit())
  expect(tickets).toHaveLength(0)
  await page.getByLabel('Who or what is in this file?', { exact: false }).fill('An oral history interview recorded with Amina in Mombasa.')
  await uploadButton.evaluate(button => (button as HTMLButtonElement).form?.requestSubmit())
  expect(tickets).toHaveLength(0)
  await page.getByRole('checkbox', { name: 'Consent for private storage has been recorded.' }).check()
  await page.getByRole('combobox', { name: 'Add a person', exact: true }).fill('Amina')
  await page.getByRole('listbox', { name: 'Add a person suggestions' }).getByRole('option').filter({ hasText: 'Amina Abdulla' }).click()
  await expect(page.getByRole('list', { name: 'People attached to media' })).toContainText('Amina Abdulla')
  await uploadButton.click()
  await expect(page.getByRole('alert').filter({ hasText: 'Upload service is temporarily unavailable' })).toBeVisible()
  expect(tickets).toHaveLength(1)
  expect(tickets[0]).toMatchObject({ title: 'New family interview', member_ids: [personId], consent_confirmed: true, mime_type: 'video/mp4' })
  expect(tickets[0]).not.toHaveProperty('public_approved')
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('New family interview')
  await expect(page.getByRole('list', { name: 'People attached to media' })).toContainText('Amina Abdulla')
})

test('retrying finalization reuses the stored object and original intent', async ({ page }) => {
  await mockLibrary(page, [])
  let tickets = 0; let uploads = 0; let finalizations = 0
  await page.route('**/api/admin/media/upload-url', route => {
    tickets++
    return route.fulfill({ json: { data: { intent_id: intentId, path: 'interview.mp4', token: 'test-upload-token' } } })
  })
  await page.route('http://127.0.0.1:3210/storage/v1/**', route => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: {
      'Access-Control-Allow-Origin': 'http://127.0.0.1:3100', 'Access-Control-Allow-Methods': 'PUT,POST,OPTIONS',
      'Access-Control-Allow-Headers': route.request().headers()['access-control-request-headers'] || '*',
    } })
    uploads++
    return route.fulfill({ headers: { 'Access-Control-Allow-Origin': 'http://127.0.0.1:3100' }, json: { Key: 'heritage-media/interview.mp4' } })
  })
  await page.route('**/api/admin/media/finalize', route => {
    expect(route.request().postDataJSON()).toEqual({ intent_id: intentId })
    finalizations++
    return finalizations === 1
      ? route.fulfill({ status: 503, json: { error: 'Validation is temporarily unavailable' } })
      : route.fulfill({ status: 201, json: { data: video } })
  })
  await page.goto('/admin/media')
  await fillUpload(page)
  await page.getByRole('button', { name: 'Upload to private library', exact: true }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Validation is temporarily unavailable' })).toBeVisible()
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('New family interview')
  await page.getByRole('button', { name: 'Retry saving upload', exact: true }).click()
  await expect.poll(() => finalizations).toBe(2)
  expect(tickets).toBe(1)
  expect(uploads).toBe(1)
})

test('family video preview has native controls and a keyboard-contained dialog with no public approval', async ({ page }, testInfo) => {
  await mockLibrary(page)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/admin/media')
  await expect(page.getByRole('button', { name: 'Preview Family interview', exact: true })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('media-desktop.png'), fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('media-mobile.png'), fullPage: true })
  const preview = page.getByRole('button', { name: 'Preview Family interview', exact: true })
  await preview.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('media-dialog.png') })
  const player = dialog.locator('video')
  await expect(player).toHaveAttribute('controls', '')
  await expect(player).toHaveAttribute('preload', 'metadata')
  await expect(player).toHaveAttribute('src', '/mock-video.mp4')
  await expect(dialog.getByRole('checkbox', { name: /Approve public use/ })).toHaveCount(0)
  await expect(dialog).toContainText(/family.*private/i)
  await dialog.getByRole('button', { name: 'Close', exact: true }).focus()
  await page.keyboard.press('Shift+Tab')
  expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(preview).toBeFocused()
})


test('legacy media can revoke public access without completing newly required archive fields', async ({ page }) => {
  const legacy = {
    ...video, title: null, subject_description: null, public_approved: true,
    member_ids: [], member_media: [], is_family_media: false, is_public: true,
    article_ids: [storyId], article_media: [{ article_id: storyId, articles: { title: 'Community memories', status: 'published' } }],
  }
  await mockLibrary(page, [legacy])
  let revocations = 0
  await page.route(`**/api/admin/media/${mediaId}`, route => {
    if (route.request().method() !== 'PATCH') return route.fulfill({ json: { data: legacy } })
    expect(route.request().postDataJSON()).toEqual({ version: 1, public_approved: false })
    revocations++
    return route.fulfill({ json: { data: { ...legacy, public_approved: false, is_public: false, version: 2 } } })
  })
  await page.goto('/admin/media')
  await page.getByRole('button', { name: 'Preview interview.mp4', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByLabel('Title', { exact: true })).toHaveValue('')
  await dialog.getByRole('button', { name: 'Remove public access', exact: true }).click()
  await expect.poll(() => revocations).toBe(1)
  await expect(dialog.getByRole('button', { name: 'Remove public access', exact: true })).toHaveCount(0)
})

test('approval requires recorded consent and lists its story scope without publishing a draft', async ({ page }) => {
  const storyMedia = {
    ...video, title: 'Community interview', consent_confirmed: false,
    member_ids: [], member_media: [], is_family_media: false,
    article_ids: [storyId], article_media: [{ article_id: storyId, articles: { title: 'Community memories', status: 'draft' } }],
  }
  await mockLibrary(page, [storyMedia])
  let approvals = 0
  await page.route(`**/api/admin/media/${mediaId}`, route => {
    if (route.request().method() !== 'PATCH') return route.fulfill({ json: { data: storyMedia } })
    const patch = route.request().postDataJSON()
    expect(patch).toMatchObject({ version: 1, consent_confirmed: true, public_approved: true })
    expect(patch).not.toHaveProperty('status')
    approvals++
    return route.fulfill({ json: { data: { ...storyMedia, ...patch, is_public: false, version: 2 } } })
  })
  await page.goto('/admin/media')
  await page.getByRole('button', { name: 'Preview Community interview', exact: true }).click()
  const dialog = page.getByRole('dialog')
  const approval = dialog.getByRole('checkbox', { name: 'Approve public use in the attached stories', exact: true })
  await expect(approval).toBeDisabled()
  await expect(dialog.getByRole('list', { name: 'Stories covered by public approval' })).toContainText('Community memories (draft)')
  await dialog.getByRole('checkbox', { name: 'Consent for private storage has been recorded.' }).check()
  await expect(approval).toBeEnabled()
  await approval.check()
  await dialog.getByRole('button', { name: 'Save details', exact: true }).click()
  await expect.poll(() => approvals).toBe(1)
  await expect(dialog).toContainText('Approved · awaiting story publication')
})
