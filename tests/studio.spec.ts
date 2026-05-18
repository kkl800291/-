import { expect, test } from '@playwright/test'

const previewHistoryItem = {
  id: 'preview-test-image',
  imageUrl: 'https://cdn.example.com/e2e-viewer-image.svg',
  prompt: 'E2E viewer image',
  createdAt: '2026-05-17T12:00:00.000Z'
}

const previewImageSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#496B4B"/><circle cx="60" cy="60" r="34" fill="#FFF9F1"/></svg>'

test('studio renders core controls', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: '上帝的画室' })).toBeVisible()
  await expect(page.getByRole('main', { name: '上帝的画室创作台' })).toBeVisible()
  await expect(page.getByText('生成结果会显示在这里')).toBeVisible()
  await expect(page.getByRole('img', { name: '实验标本图' })).toHaveCount(0)
  const modelSelect = page.getByRole('combobox', { name: '模型' })
  await expect(modelSelect).toBeVisible()
  await expect(modelSelect).toContainText('GPT Image 2')
  await expect(page.getByRole('group', { name: '分辨率' }).getByRole('button', { name: '4K' })).toBeDisabled()
  await expect(page.getByLabel('提示词')).toBeVisible()
  await expect(page.getByRole('button', { name: /生成图片/ })).toBeDisabled()
})

test('model capabilities disable unavailable 4K option', async ({ page }) => {
  await page.goto('/')

  const resolution = page.getByRole('group', { name: '分辨率' })
  const modelSelect = page.getByRole('combobox', { name: '模型' })

  await modelSelect.click()
  await page.getByRole('listbox', { name: '模型' }).getByRole('option', { name: 'GPT Image 2', exact: true }).click()
  await expect(resolution.getByRole('button', { name: '4K' })).toBeDisabled()

  await modelSelect.click()
  await page.getByRole('listbox', { name: '模型' }).getByRole('option', { name: 'GPT Image 2 VIP', exact: true }).click()
  await expect(resolution.getByRole('button', { name: '4K' })).toBeEnabled()
})

test('opens a zoomable image viewer from a selected history image', async ({ page }) => {
  await page.route(previewHistoryItem.imageUrl, (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: previewImageSvg
    })
  )
  await page.route('**/api/download-image?**', (route) =>
    route.fulfill({
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': 'attachment; filename="rightcodes-image.png"'
      },
      body: previewImageSvg
    })
  )
  await page.addInitScript((item) => {
    window.localStorage.setItem('rightcodes-history', JSON.stringify([item]))
  }, previewHistoryItem)

  await page.goto('/')
  await page.getByRole('button', { name: '选择历史图片' }).click()
  await expect(page.getByRole('button', { name: '打开原图' })).toHaveCount(0)
  await page.getByRole('button', { name: '查看大图' }).click()

  await expect(page.getByRole('dialog', { name: '图片预览' })).toBeVisible()
  await expect(page.getByRole('button', { name: '放大' })).toBeVisible()
  await expect(page.getByRole('button', { name: '下载图片' })).toBeVisible()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '下载图片' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('rightcodes-image.png')

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: '图片预览' })).toBeHidden()
})
