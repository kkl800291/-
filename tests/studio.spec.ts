import { expect, test } from '@playwright/test'

test('studio renders core controls', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'RightCodes Studio' })).toBeVisible()
  await expect(page.getByLabel('模型')).toBeVisible()
  await expect(page.getByRole('group', { name: '分辨率' }).getByRole('button', { name: '4K' })).toBeEnabled()
  await expect(page.getByLabel('提示词')).toBeVisible()
  await expect(page.getByRole('button', { name: /生成图片/ })).toBeDisabled()
})

test('model capabilities disable unavailable 4K option', async ({ page }) => {
  await page.goto('/')

  const resolution = page.getByRole('group', { name: '分辨率' })
  await expect(resolution.getByRole('button', { name: '4K' })).toBeEnabled()

  await page.getByLabel('模型').selectOption('gpt-image-2')
  await expect(resolution.getByRole('button', { name: '4K' })).toBeDisabled()
})
