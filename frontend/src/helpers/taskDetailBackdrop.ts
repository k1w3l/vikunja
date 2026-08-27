export function isTaskDetailPath(path: string | undefined | null): boolean {
	return typeof path === 'string' && /\/tasks\/\d+/.test(path)
}

export function getTaskDetailBackdrop(currentFullPath: string): string {
	if (typeof window === 'undefined') {
		return currentFullPath
	}

	const state = window.history.state
	if (isTaskDetailPath(currentFullPath)) {
		const existing = state?.backdropView
		if (typeof existing === 'string' && existing.length > 0 && !isTaskDetailPath(existing)) {
			return existing
		}
		const back = state?.back
		if (typeof back === 'string' && back.length > 0 && !isTaskDetailPath(back)) {
			return back
		}
		return '/'
	}

	return currentFullPath
}

export function taskDetailLocation(taskId: number | string, currentFullPath: string) {
	return {
		name: 'task.detail' as const,
		params: {id: taskId},
		state: {backdropView: getTaskDetailBackdrop(currentFullPath)},
	}
}
