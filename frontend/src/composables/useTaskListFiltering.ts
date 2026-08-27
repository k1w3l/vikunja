import {PRIORITIES} from '@/constants/priorities'
import type {ITask} from '@/modelTypes/ITask'

/**
 * Loose-row visibility for Overview, Upcoming, project list, and kanban.
 *
 * Tasks without a parent always show. Subtasks only appear as their own row
 * when showInList is on; they still nest under the parent in the project list.
 */
export function shouldShowTaskInListView(task: ITask): boolean {
	const parentTasksCount = task.relatedTasks?.parenttask?.length ?? 0
	if (parentTasksCount === 0) {
		return true
	}

	return Boolean(task.showInList)
}

export function shouldShowTaskOnOverview(task: ITask, isInbox: boolean, isDaily = false): boolean {
	if (!shouldShowTaskInListView(task)) {
		return false
	}

	if (isInbox || isDaily) {
		return true
	}

	if (task.percentDone > 0) {
		return true
	}

	return task.priority > PRIORITIES.MEDIUM
}
