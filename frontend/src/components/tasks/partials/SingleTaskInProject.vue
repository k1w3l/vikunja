<template>
	<div
		:data-task-id="task.id"
		:data-project-id="task.projectId"
	>
		<div
			ref="taskRoot"
			:class="{'is-loading': taskService.loading, 'is-completing': isCompleting}"
			class="task loader-container single-task"
			tabindex="-1"
			:data-is-overdue="isOverdue || undefined"
			@click="openTaskDetail"
			@keyup.enter="openTaskDetail"
		>
			<BaseButton
				v-if="hasSubtasks"
				class="subtask-toggle"
				:aria-label="$t('task.toggleSubtasks')"
				:aria-expanded="subtasksOpen"
				@click.stop="subtasksOpen = !subtasksOpen"
			>
				<Icon
					icon="chevron-down"
					:class="{'is-collapsed': !subtasksOpen}"
				/>
			</BaseButton>
			<span
				v-else
				class="subtask-toggle-placeholder"
			/>
			<span
				v-tooltip="!canMarkAsDone ? $t('task.readOnlyCheckbox') : ''"
				class="is-inline-flex is-align-items-center"
			>
				<FancyCheckbox
					v-model="task.done"
					tone="complete"
					:disabled="isArchived || disabled || !canMarkAsDone"
					:aria-label="$t('task.detail.markAsDone', {task: task.title})"
					@update:modelValue="markAsDone"
					@click.stop
				/>
			</span>

			<div
				:class="{ 'done': task.done }"
				class="task-main"
			>
				<span class="is-inline-flex is-align-items-center task-title-row">
					<ColorBubble
						v-if="task.hexColor !== ''"
						:color="getHexColor(task.hexColor)"
						class="mie-1"
					/>

					<TaskGlanceTooltip :task="task">
						<RouterLink
							ref="taskLinkRef"
							:to="taskDetailRoute"
							class="task-link"
							:title="task.title"
						>
							{{ displayTaskTitle(task.title) }}
						</RouterLink>
					</TaskGlanceTooltip>
				</span>
			</div>

			<div class="task-meta">
				<Labels
					v-if="task.labels.length > 0"
					class="labels"
					:labels="task.labels"
				/>

				<PriorityLabel
					:priority="task.priority"
					:done="task.done"
				/>

				<AssigneeList
					v-if="task.assignees.length > 0"
					:assignees="task.assignees"
					:avatar-size="25"
					:inline="true"
				/>

				<Popup
					v-if="+new Date(task.dueDate) > 0"
				>
					<template #trigger="{toggle, isOpen}">
						<BaseButton
							v-tooltip="formatDateLong(task.dueDate)"
							class="dueDate"
							@click.prevent.stop="toggle()"
						>
							<time
								:datetime="formatISO(task.dueDate)"
								class="is-italic"
								:aria-expanded="isOpen ? 'true' : 'false'"
							>
								{{ $t('task.detail.due', {at: dueDateFormatted}) }}
							</time>
						</BaseButton>
					</template>
					<template #content="{isOpen}">
						<DeferTask
							v-if="isOpen"
							v-model="task"
							@update:modelValue="deferTaskUpdate"
						/>
					</template>
				</Popup>

				<span class="task-meta-icons">
					<span
						v-if="task.attachments.length > 0"
						class="project-task-icon"
						role="img"
						:aria-label="$t('task.attributes.attachment', task.attachments.length)"
					>
						<Icon icon="paperclip" />
					</span>
					<span
						v-if="!isEditorContentEmpty(task.description)"
						class="project-task-icon is-mirrored-rtl"
					>
						<Icon icon="align-left" />
					</span>
					<span
						v-if="isRepeating"
						class="project-task-icon"
					>
						<Icon icon="history" />
					</span>
					<CommentCount
						:task="task"
						class="project-task-icon"
					/>
				</span>

				<ChecklistSummary :task="task" />

				<ColorBubble
					v-if="showProjectInMeta && projectColor !== ''"
					:color="projectColor"
				/>

				<RouterLink
					v-if="showProjectInMeta"
					v-tooltip="$t('task.detail.belongsToProject', {project: project.title})"
					:to="{ name: 'project.index', params: { projectId: task.projectId } }"
					class="task-project"
					@click.stop
				>
					{{ project.title }}
				</RouterLink>

				<BaseButton
					:class="{'is-favorite': task.isFavorite}"
					class="favorite"
					@click.stop="toggleFavorite"
				>
					<span class="is-sr-only">{{ task.isFavorite ? $t('task.detail.actions.unfavorite') : $t('task.detail.actions.favorite') }}</span>
					<Icon
						v-if="task.isFavorite"
						icon="star"
					/>
					<Icon
						v-else
						:icon="['far', 'star']"
					/>
				</BaseButton>
			</div>

			<ProgressBar
				v-if="task.percentDone > 0"
				class="task-progress"
				:value="task.percentDone * 100"
			/>
			<slot />
		</div>
		<template v-if="hasSubtasks && subtasksOpen">
			<template v-for="subtask in task.relatedTasks.subtask">
				<template v-if="getTaskById(subtask.id)">
					<single-task-in-project
						:key="subtask.id"
						:the-task="getTaskById(subtask.id)"
						:disabled="disabled"
						:can-mark-as-done="canMarkAsDone"
						:all-tasks="allTasks"
						class="subtask-nested"
					/>
				</template>
			</template>
		</template>
	</div>
</template>

<script setup lang="ts">
import {ref, watch, shallowReactive, onMounted, onBeforeUnmount, computed} from 'vue'
import {useRouter} from 'vue-router'
import {useI18n} from 'vue-i18n'

import TaskModel, {getHexColor} from '@/models/task'
import type {ITask} from '@/modelTypes/ITask'

import PriorityLabel from '@/components/tasks/partials/PriorityLabel.vue'
import Labels from '@/components/tasks/partials/Labels.vue'
import TaskGlanceTooltip from '@/components/tasks/partials/TaskGlanceTooltip.vue'
import DeferTask from '@/components/tasks/partials/DeferTask.vue'
import ChecklistSummary from '@/components/tasks/partials/ChecklistSummary.vue'
import CommentCount from '@/components/tasks/partials/CommentCount.vue'

import ProgressBar from '@/components/misc/ProgressBar.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import FancyCheckbox from '@/components/input/FancyCheckbox.vue'
import ColorBubble from '@/components/misc/ColorBubble.vue'
import Popup from '@/components/misc/Popup.vue'

import TaskService from '@/services/task'

import {formatDisplayDate, formatISO, formatDateLong} from '@/helpers/time/formatDate'
import {success} from '@/message'

import {useProjectStore} from '@/stores/projects'
import {useBaseStore} from '@/stores/base'
import {useTaskStore} from '@/stores/tasks'
import AssigneeList from '@/components/tasks/partials/AssigneeList.vue'
import {useIntervalFn} from '@vueuse/core'
import {playPopSound} from '@/helpers/playPop'
import {isEditorContentEmpty} from '@/helpers/editorContentEmpty'
import {TASK_REPEAT_MODES} from '@/types/IRepeatMode'
import {useGlobalNow} from '@/composables/useGlobalNow'
import {taskDetailLocation} from '@/helpers/taskDetailBackdrop'
import {displayTaskTitle} from '@/helpers/displayTaskTitle'

const props = withDefaults(defineProps<{
	theTask: ITask,
	isArchived?: boolean,
	showProject?: boolean,
	showForeignProject?: boolean,
	disabled?: boolean,
	canMarkAsDone?: boolean,
	allTasks?: ITask[],
}>(), {
	isArchived: false,
	showProject: false,
	showForeignProject: true,
	disabled: false,
	canMarkAsDone: true,
	allTasks: () => [],
})

const emit = defineEmits<{
	'taskUpdated': [task: ITask],
}>()

function getTaskById(taskId: number): ITask | undefined {
	if (typeof props.allTasks === 'undefined' || props.allTasks.length === 0) {
		return null
	}

	return props.allTasks.find(t => t.id === taskId)
}

const {t} = useI18n({useScope: 'global'})

const taskService = shallowReactive(new TaskService())
const task = ref<ITask>(new TaskModel())

const isRepeating = computed(() => task.value.repeatAfter.amount > 0 || (task.value.repeatAfter.amount === 0 && task.value.repeatMode === TASK_REPEAT_MODES.REPEAT_MODE_MONTH))
const hasSubtasks = computed(() => (task.value.relatedTasks?.subtask?.length ?? 0) > 0)
const subtasksOpen = ref(true)

watch(
	() => props.theTask,
	newVal => {
		task.value = newVal
	},
	{
		immediate: true,
		deep: true,
	},
)

const baseStore = useBaseStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const router = useRouter()

const project = computed(() => projectStore.projects[task.value.projectId])
const projectColor = computed(() => project.value ? project.value?.hexColor : '')

const showProjectSeparately = computed(() => props.showForeignProject && !props.showProject && currentProject.value?.id !== task.value.projectId && project.value)
const showProjectInMeta = computed(() => Boolean((props.showProject && project.value) || showProjectSeparately.value))

const currentProject = computed(() => {
	return typeof baseStore.currentProject === 'undefined' ? {
		id: 0,
		title: '',
	} : baseStore.currentProject
})

const taskDetailRoute = computed(() => taskDetailLocation(task.value.id, router.currentRoute.value.fullPath))

function updateDueDate() {
	if (!task.value.dueDate) {
		return
	}

	dueDateFormatted.value = formatDisplayDate(task.value.dueDate)
}

const dueDateFormatted = ref('')
useIntervalFn(updateDueDate, 60_000, {
	immediateCallback: true,
})
onMounted(updateDueDate)

watch(() => task.value.dueDate, updateDueDate)

const {now} = useGlobalNow()
const isOverdue = computed(() => (
	!task.value.done &&
	task.value.dueDate !== null &&
	task.value.dueDate.getTime() > 0 &&
	task.value.dueDate.getTime() <= now.value.getTime()
))

let oldTask
const isCompleting = ref(false)
let completingTimer: ReturnType<typeof setTimeout> | undefined

async function markAsDone(checked: boolean, wasReverted: boolean = false) {
	oldTask = {...task.value}

	if (checked) {
		isCompleting.value = true
		clearTimeout(completingTimer)
		completingTimer = setTimeout(() => {
			isCompleting.value = false
		}, 400)
	}

	// Fire the request immediately and with the intended done value snapshotted, so a re-render or
	// teardown during the animation delay can neither drop the save nor make it send a stale state.
	const updatePromise = taskStore.update({
		...task.value,
		done: checked,
	})

	const finish = async () => {
		const newTask = await updatePromise
		task.value = newTask

		updateDueDate()

		if (wasReverted) {
			return
		}

		if (checked) {
			playPopSound()
		}
		emit('taskUpdated', newTask)

		let message = t('task.doneSuccess')
		if (!task.value.done && !isRepeating.value) {
			message = t('task.undoneSuccess')
		}

		success({message, title: false}, [{
			title: t('task.undo'),
			callback: () => undoDone(checked),
		}])
	}

	if (checked) {
		setTimeout(finish, 300) // Delay only the follow-up to show the animation when marking a task as done
	} else {
		await finish() // Don't delay it when un-marking it as it doesn't have an animation the other way around
	}
}

function undoDone(checked: boolean) {
	if (isRepeating.value) {
		task.value = {...oldTask}
	}
	task.value.done = !task.value.done
	markAsDone(!checked, true)
}

function deferTaskUpdate(updated: ITask) {
	task.value = updated
	emit('taskUpdated', updated)
}

async function toggleFavorite() {
	task.value = await taskStore.toggleFavorite(task.value)
	emit('taskUpdated', task.value)
}

const taskRoot = ref<HTMLElement | null>(null)
const taskLinkRef = ref<HTMLElement | null>(null)

function hasTextSelected() {
	const isTextSelected = window.getSelection().toString()
	return !(typeof isTextSelected === 'undefined' || isTextSelected === '' || isTextSelected === '\n')
}

function openTaskDetail(event: MouseEvent | KeyboardEvent) {
	if (event.target instanceof HTMLElement) {
		const isInteractiveElement = event.target.closest('a, button, label, input[type="checkbox"], .favorite, [role="button"]')
		if (isInteractiveElement || hasTextSelected()) {
			return
		}
	}

	taskLinkRef.value?.$el.click()
}

onBeforeUnmount(() => {
	clearTimeout(completingTimer)
})

defineExpose({
	focus: () => taskRoot.value?.focus(),
	click: (e: MouseEvent | KeyboardEvent) => openTaskDetail(e),
})
</script>

<style lang="scss" scoped>
.task {
	contain: layout style;
	content-visibility: auto;
	contain-intrinsic-block-size: auto 3rem;
	display: flex;
	flex-wrap: wrap;
	padding: .5rem .75rem;
	transition: background-color $transition;
	align-items: center;
	cursor: pointer;
	border-radius: $radius-large;
	border: 1px solid transparent;

	&:hover {
		background-color: var(--grey-100);
	}

	&:has(*:focus-visible), &:focus {
		box-shadow: 0 0 0 2px hsla(var(--primary-hsl), 0.5);

		a.task-link {
			box-shadow: none;
		}
	}

	@supports not selector(:focus-within) {
		:focus {
			box-shadow: 0 0 0 2px hsla(var(--primary-hsl), 0.5);

			a.task-link {
				box-shadow: none;
			}
		}
	}

	.task-main {
		min-inline-size: 0;
		flex: 1 1 0;
		overflow: hidden;
	}

	.task-title-row {
		display: inline-flex;
		min-inline-size: 0;
		max-inline-size: 100%;
		overflow: hidden;
	}

	:deep(.task-glance-trigger) {
		display: block;
		min-inline-size: 0;
		flex: 1 1 auto;
		max-inline-size: 100%;
		overflow: hidden;
	}

	.task-link {
		display: block;
		min-inline-size: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.task-meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.35rem;
		flex: 0 1 auto;
		margin-inline-start: auto;
	}

	.task-meta-icons {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	.task-progress {
		flex: 1 0 100%;
		inline-size: 100%;
		margin-block-start: 0.35rem;
	}

	.tasktext,
	&.tasktext {
		min-inline-size: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.dueDate {
		display: inline-block;
		margin-inline-start: 0;

		&:focus-visible {
			box-shadow: none;

			time {
				box-shadow: 0 0 0 1px hsla(var(--primary-hsl), 0.5);
				border-radius: 3px;
			}
		}
	}

	&[data-is-overdue] .dueDate {
		color: var(--danger-text);
	}

	.task-project {
		inline-size: auto;
		color: var(--grey-400);
		font-size: 0.95rem;
		white-space: nowrap;
	}

	.avatar {
		border-radius: 50%;
		vertical-align: bottom;
		margin-inline-start: 5px;
		block-size: 27px;
		inline-size: 27px;
	}

	.project-task-icon {
		margin-inline-start: 6px;

		&:not(:first-of-type) {
			margin-inline-start: 8px;
		}

	}

	a {
		color: var(--text);
		transition: color ease $transition-duration;

		&:hover {
			color: var(--grey-900);
		}
	}

	.favorite {
		opacity: 1;
		text-align: center;
		inline-size: 27px;
		transition: opacity $transition, color $transition;
		border-radius: $radius;

		&:hover {
			color: var(--warning-text);
		}

		&.is-favorite {
			opacity: 1;
			color: var(--warning-text);
		}
	}

	@media(hover: hover) and (pointer: fine) {
		& .favorite {
			opacity: 0;
		}

		&:hover .favorite {
			opacity: 1;
		}
	}

	.favorite:focus {
		opacity: 1;
	}

	:deep(.fancy-checkbox) {
		block-size: 18px;
		padding-block-start: 0;
		padding-inline-end: .5rem;

		span {
			display: none;
		}

		// Extend the hit target to >=44x44 without affecting layout (WCAG 2.5.5).
		.base-checkbox__label {
			position: relative;

			&::before {
				content: '';
				position: absolute;
				inset-block-start: 50%;
				inset-inline-start: 50%;
				min-block-size: 44px;
				min-inline-size: 44px;
				block-size: 100%;
				inline-size: 100%;
				transform: translate(-50%, -50%);
			}
		}
	}

	.task-main.done {
		color: var(--text-muted);

		.task-link {
			text-decoration: line-through;
			text-decoration-color: var(--success-text);
			text-decoration-thickness: 1.5px;
			text-underline-offset: 0.2em;
		}
	}

	&.is-completing .task-main.done .task-link {
		background-image: linear-gradient(var(--success-text), var(--success-text));
		background-repeat: no-repeat;
		background-position: 0 55%;
		background-size: 100% 1.5px;
		text-decoration-color: transparent;
		animation: task-strike 280ms $ease-out-expo;
	}

	span.parent-tasks {
		color: var(--grey-500);
		inline-size: auto;
	}

	.show-project .parent-tasks {
		padding-inline-start: .25rem;
	}

	.remove {
		color: var(--danger-text);
	}

	input[type='checkbox'] {
		vertical-align: middle;
	}

	.settings {
		float: inline-end;
		inline-size: 24px;
		cursor: pointer;
	}

	&.loader-container.is-loading:after {
		inset-block-start: calc(50% - 1rem);
		inset-inline-start: calc(50% - 1rem);
		inline-size: 2rem;
		block-size: 2rem;
		border-inline-start-color: var(--grey-300);
		border-block-end-color: var(--grey-300);
	}

	@media (prefers-reduced-motion: reduce) {
		&.is-completing .task-main.done .task-link {
			animation: none;
			text-decoration-color: var(--success-text);
			background-image: none;
		}
	}
}

@keyframes task-strike {
	from {
		background-size: 0 1.5px;
	}

	to {
		background-size: 100% 1.5px;
	}
}

.subtask-toggle {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	inline-size: 1.5rem;
	block-size: 1.5rem;
	flex-shrink: 0;
	color: var(--grey-600);

	:deep(svg) {
		transition: transform $transition;
	}

	.is-collapsed {
		transform: rotate(-90deg);
	}
}

.subtask-toggle-placeholder {
	inline-size: 1.5rem;
	flex-shrink: 0;
}

.subtask-nested {
	margin-inline-start: 1.75rem;
}

:deep(.popup) {
	border-radius: $radius;
	background-color: var(--white);
	box-shadow: var(--shadow-lg);
	color: var(--text);
	inset-block-start: unset;
	
	&.is-open {
		padding: 1rem;
		border: 1px solid var(--grey-200);
	}
}
</style>
