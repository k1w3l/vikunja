import {APP_NAME} from '@/constants/brand'

export function setTitle(title : undefined | string) {
	document.title = (typeof title === 'undefined' || title === '')
		? APP_NAME
		: `${title} | ${APP_NAME}`
}
