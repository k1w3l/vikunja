import {test, expect} from '../../support/fixtures'
import {ProjectFactory} from '../../factories/project'
import {ProjectViewFactory} from '../../factories/project_view'

test.describe('Project History', () => {
	test('should not show last viewed projects on the overview page', async ({authenticatedPage: page}) => {
		test.setTimeout(60000)
		const projects = await ProjectFactory.create(3)
		for (const p of projects) {
			await ProjectViewFactory.create(1, {
				id: p.id,
				project_id: p.id,
			}, false)
		}

		for (const project of projects) {
			const loadProjectPromise = page.waitForResponse(response =>
				response.url().includes(`/projects/${project.id}`) && response.request().method() === 'GET',
			)
			await page.goto(`/projects/${project.id}/${project.id}`)
			await loadProjectPromise
			await page.waitForFunction(
				(projectId) => {
					const history = JSON.parse(localStorage.getItem('projectHistory') || '[]')
					return history.some((h: {id: number}) => h.id === projectId)
				},
				project.id,
			)
		}

		await page.locator('nav.menu.top-menu a').filter({hasText: 'Overview'}).click()
		await expect(page.locator('body')).not.toContainText('Last viewed')
		await expect(page.locator('.project-grid')).toHaveCount(0)
	})
})
