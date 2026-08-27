import {computed} from 'vue'

import {projectNavIcon} from '@/helpers/projectNavIcon'
import type {IProject} from '@/modelTypes/IProject'
import type {IFrontendSettings} from '@/modelTypes/IUserSettings'
import {useAuthStore} from '@/stores/auth'

export function useProjectIcon() {
	const authStore = useAuthStore()

	const projectIcons = computed(() => authStore.settings?.frontendSettings?.projectIcons ?? {})

	function iconFor(project: Pick<IProject, 'id' | 'title'>) {
		const icons = projectIcons.value
		const override = icons[project.id] ?? icons[Number(project.id)]
		return projectNavIcon(project, override)
	}

	async function setIcon(projectId: IProject['id'], icon: string) {
		await authStore.saveUserSettings({
			settings: {
				...authStore.settings,
				frontendSettings: {
					...authStore.settings.frontendSettings,
					projectIcons: {
						...(authStore.settings.frontendSettings.projectIcons ?? {}),
						[projectId]: icon,
					},
				} as IFrontendSettings,
			},
			showMessage: false,
		})
	}

	return {
		iconFor,
		setIcon,
	}
}
