import {i18n} from '@/i18n'
import type {IProject} from '@/modelTypes/IProject'

export function isInboxProject(project: Pick<IProject, 'title'> | null | undefined): boolean {
	return project?.title === 'Inbox'
}

export function isDailyProject(project: Pick<IProject, 'title'> | null | undefined): boolean {
	return /^(daily|today|hoje)$/i.test(project?.title?.trim() ?? '')
}

export function getProjectTitle(project: Pick<IProject, 'id' | 'title'>) {
	if (project.id === -1) {
		return i18n.global.t('project.pseudo.favorites.title')
	}

	if (project.title === 'Inbox') {
		return i18n.global.t('project.inboxTitle')
	}

	if (project.title === 'My Open Tasks') {
		return i18n.global.t('project.myOpenTasksFilterTitle')
	}

	return project.title
}
