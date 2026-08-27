import {describe, it, expect} from 'vitest'
import {shouldShowTaskInListView, shouldShowTaskOnOverview} from './useTaskListFiltering'
import type {ITask} from '@/modelTypes/ITask'
import {PRIORITIES} from '@/constants/priorities'

describe('shouldShowTaskInListView', () => {
	it('should hide subtasks unless showInList is on', () => {
		const parentTask: Partial<ITask> = {
			id: 1,
			title: 'Parent Task',
			projectId: 100,
			relatedTasks: {},
		}

		const subtask: Partial<ITask> = {
			id: 2,
			title: 'Subtask',
			projectId: 100,
			relatedTasks: {
				parenttask: [{
					id: 1,
					title: 'Parent Task',
					projectId: 100,
				} as ITask],
			},
		}

		expect(shouldShowTaskInListView(parentTask as ITask)).toBe(true)
		expect(shouldShowTaskInListView(subtask as ITask)).toBe(false)
	})

	it('should hide subtasks even when the parent is in a different project', () => {
		const subtask: Partial<ITask> = {
			id: 2,
			title: 'Subtask in Project B',
			projectId: 200,
			relatedTasks: {
				parenttask: [{
					id: 1,
					title: 'Parent Task in Project A',
					projectId: 100,
				} as ITask],
			},
		}

		expect(shouldShowTaskInListView(subtask as ITask)).toBe(false)
	})

	it('should show a subtask as a loose row when showInList is on', () => {
		const subtask: Partial<ITask> = {
			id: 2,
			title: 'Subtask',
			projectId: 100,
			showInList: true,
			relatedTasks: {
				parenttask: [{
					id: 1,
					title: 'Parent Task',
					projectId: 100,
				} as ITask],
			},
		}

		expect(shouldShowTaskInListView(subtask as ITask)).toBe(true)
	})

	it('should show tasks with no parents', () => {
		const task: Partial<ITask> = {
			id: 1,
			title: 'Regular Task',
			projectId: 100,
			relatedTasks: {},
		}

		expect(shouldShowTaskInListView(task as ITask)).toBe(true)
	})

	it('should show tasks with undefined relatedTasks', () => {
		const task: Partial<ITask> = {
			id: 1,
			title: 'Regular Task',
			projectId: 100,
		}

		expect(shouldShowTaskInListView(task as ITask)).toBe(true)
	})

	it('should show tasks with empty parenttask array', () => {
		const task: Partial<ITask> = {
			id: 1,
			title: 'Regular Task',
			projectId: 100,
			relatedTasks: {
				parenttask: [],
			},
		}

		expect(shouldShowTaskInListView(task as ITask)).toBe(true)
	})

	it('should ignore showInList on tasks without a parent', () => {
		const task: Partial<ITask> = {
			id: 1,
			title: 'Regular Task',
			projectId: 100,
			showInList: false,
			relatedTasks: {},
		}

		expect(shouldShowTaskInListView(task as ITask)).toBe(true)
	})

	it('should handle multiple levels of nesting within same project', () => {
		const grandparent: Partial<ITask> = {
			id: 1,
			title: 'Grandparent',
			projectId: 100,
			relatedTasks: {},
		}

		const parent: Partial<ITask> = {
			id: 2,
			title: 'Parent',
			projectId: 100,
			relatedTasks: {
				parenttask: [{id: 1, title: 'Grandparent', projectId: 100} as ITask],
			},
		}

		const child: Partial<ITask> = {
			id: 3,
			title: 'Child',
			projectId: 100,
			relatedTasks: {
				parenttask: [{id: 2, title: 'Parent', projectId: 100} as ITask],
			},
		}

		expect(shouldShowTaskInListView(grandparent as ITask)).toBe(true)
		expect(shouldShowTaskInListView(parent as ITask)).toBe(false)
		expect(shouldShowTaskInListView(child as ITask)).toBe(false)
	})

	it('should hide a subtask when none of its parents are in view unless showInList is on', () => {
		const subtask: Partial<ITask> = {
			id: 3,
			title: 'Subtask with multiple parents',
			projectId: 300,
			relatedTasks: {
				parenttask: [
					{id: 1, title: 'Parent 1', projectId: 100} as ITask,
					{id: 2, title: 'Parent 2', projectId: 200} as ITask,
				],
			},
		}

		expect(shouldShowTaskInListView(subtask as ITask)).toBe(false)
	})

	it('should hide a subtask expanded for context when its parent is in the view', () => {
		const parentTask: Partial<ITask> = {
			id: 1,
			title: 'Parent Task matching the filter',
			projectId: 100,
			relatedTasks: {},
		}

		const subtask: Partial<ITask> = {
			id: 2,
			title: 'Subtask not matching the filter',
			projectId: 100,
			relatedTasks: {
				parenttask: [{
					id: 1,
					title: 'Parent Task matching the filter',
					projectId: 100,
				} as ITask],
			},
		}

		expect(shouldShowTaskInListView(parentTask as ITask)).toBe(true)
		expect(shouldShowTaskInListView(subtask as ITask)).toBe(false)
	})
})

describe('shouldShowTaskOnOverview', () => {
	const baseTask: Partial<ITask> = {
		id: 1,
		title: 'Task',
		projectId: 100,
		percentDone: 0,
		priority: PRIORITIES.UNSET,
		relatedTasks: {},
	}

	it('should show inbox tasks even without progress or high priority', () => {
		expect(shouldShowTaskOnOverview(baseTask as ITask, true)).toBe(true)
	})

	it('should show non-inbox tasks with progress', () => {
		expect(shouldShowTaskOnOverview({
			...baseTask,
			percentDone: 0.2,
		} as ITask, false)).toBe(true)
	})

	it('should show non-inbox tasks with priority above medium', () => {
		expect(shouldShowTaskOnOverview({
			...baseTask,
			priority: PRIORITIES.HIGH,
		} as ITask, false)).toBe(true)
	})

	it('should hide non-inbox tasks with medium priority and no progress', () => {
		expect(shouldShowTaskOnOverview({
			...baseTask,
			priority: PRIORITIES.MEDIUM,
		} as ITask, false)).toBe(false)
	})

	it('should hide subtasks on overview unless showInList is on', () => {
		const subtask: Partial<ITask> = {
			...baseTask,
			relatedTasks: {
				parenttask: [{id: 9, title: 'Parent', projectId: 100} as ITask],
			},
		}

		expect(shouldShowTaskOnOverview(subtask as ITask, true)).toBe(false)
		expect(shouldShowTaskOnOverview({...subtask, showInList: true} as ITask, true)).toBe(true)
	})
})
