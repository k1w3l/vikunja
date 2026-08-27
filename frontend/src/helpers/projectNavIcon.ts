import type {IconProp} from '@fortawesome/fontawesome-svg-core'

import type {IProject} from '@/modelTypes/IProject'
import {stringHash} from '@/helpers/stringHash'
import {isSavedFilter} from '@/services/savedFilter'

const PROJECT_ICONS: IconProp[] = [
	'layer-group',
	'calendar',
	'tasks',
	'coffee',
	'sitemap',
	'star',
	'th',
	'archive',
	'cog',
	'chess-knight',
	'bolt',
	'list',
	'bell',
	'tags',
	'users',
	'filter',
]

export function projectNavIcon(project: Pick<IProject, 'id' | 'title'>): IconProp {
	if (project.id === -1) {
		return 'star'
	}
	if (isSavedFilter(project) || project.id < -1) {
		return 'filter'
	}
	if (/inbox/i.test(project.title)) {
		return 'archive'
	}

	return PROJECT_ICONS[stringHash(project.title) % PROJECT_ICONS.length]
}
