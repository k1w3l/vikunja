const TASK_TITLE_DISPLAY_MAX = 80

export function displayTaskTitle(title: string): string {
	if (title.length <= TASK_TITLE_DISPLAY_MAX) {
		return title
	}
	return `${title.slice(0, TASK_TITLE_DISPLAY_MAX)}…`
}
