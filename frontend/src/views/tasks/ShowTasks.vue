<template>
	<div
		v-cy="'showTasks'"
		class="is-max-width-desktop has-text-start"
	>
		<h2
			v-if="!overview"
			class="mbe-2 title"
		>
			{{ pageTitle }}
		</h2>
		<Message
			v-if="filteredLabels.length > 0"
			class="label-filter-info mbe-2"
		>
			<i18n-t
				keypath="task.show.filterByLabel"
				tag="span"
				class="filter-label-text"
			>
				<template #label>
					<XLabel
						v-for="label in filteredLabels"
						:key="label.id"
						:label="label"
					/>
				</template>
			</i18n-t>
			<BaseButton
				v-tooltip="$t('task.show.clearLabelFilter')"
				class="clear-filter-button"
				:aria-label="$t('task.show.clearLabelFilter')"
				@click="clearLabelFilter"
			>
				<Icon icon="times" />
			</BaseButton>
		</Message>
		<Message
			v-if="savedFilterIgnored"
			class="mbe-2"
		>
			{{ $t('task.show.savedFilterIgnored') }}
		</Message>
		<p
			v-if="!showAll"
			class="show-tasks-options"
		>
			<DatepickerWithRange @update:modelValue="setDate">
				<template #trigger="{toggle}">
					<XButton
						variant="primary"
						:shadow="false"
						class="mbe-2"
						@click.prevent.stop="toggle()"
					>
						{{ $t('task.show.select') }}
					</XButton>
				</template>
			</DatepickerWithRange>
			<FancyCheckbox
				:model-value="showNulls"
				class="mie-2"
				@update:modelValue="setShowNulls"
			>
				{{ $t('task.show.noDates') }}
			</FancyCheckbox>
			<FancyCheckbox
				:model-value="showOverdue"
				@update:modelValue="setShowOverdue"
			>
				{{ $t('task.show.overdue') }}
			</FancyCheckbox>
		</p>
		<template v-if="!loading && !hasTasks && showNothingToDo">
			<h3 class="has-text-centered mbs-6">
				{{ $t('task.show.noTasks') }}
			</h3>
			<LlamaCool class="llama-cool" />
		</template>

		<template v-if="hasTasks">
			<template v-if="overview">
				<section
					v-for="group in overviewGroups"
					:key="group.projectId"
					class="overview-project"
				>
					<h3 class="overview-project-title">
						<span class="overview-project-glyph">
							<Icon
								v-if="group.project"
								:icon="iconFor(group.project)"
							/>
						</span>
						{{ group.title }}
					</h3>
					<ul
						class="overview-tasks"
						:class="{'is-laying': isLaying}"
					>
						<li
							v-for="task in group.tasks"
							:key="task.id"
						>
							<SingleTaskInProject
								:show-project="false"
								:the-task="task"
								:can-mark-as-done="(projectStore.projects[task.projectId]?.maxPermission ?? 0) > PERMISSIONS.READ"
								@taskUpdated="updateTasks"
							/>
						</li>
					</ul>
				</section>
			</template>
			<Card
				v-else
				:padding="false"
				class="has-overflow"
				:has-content="false"
				:loading="loading"
			>
				<ul
					class="p-2 tasks"
					:class="{'is-laying': isLaying}"
				>
					<li
						v-for="task in visibleTasks"
						:key="task.id"
					>
						<SingleTaskInProject
							:show-project="true"
							:the-task="task"
							:can-mark-as-done="(projectStore.projects[task.projectId]?.maxPermission ?? 0) > PERMISSIONS.READ"
							@taskUpdated="updateTasks"
						/>
					</li>
				</ul>
			</Card>
		</template>
		<div
			v-else
			:class="{ 'is-loading': loading}"
			class="spinner"
		/>
	</div>
</template>

<script setup lang="ts">
import {computed, ref, watch, watchEffect} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useI18n} from 'vue-i18n'

import {formatDate} from '@/helpers/time/formatDate'
import {setTitle} from '@/helpers/setTitle'

import BaseButton from '@/components/base/BaseButton.vue'
import Icon from '@/components/misc/Icon'
import Message from '@/components/misc/Message.vue'
import FancyCheckbox from '@/components/input/FancyCheckbox.vue'
import SingleTaskInProject from '@/components/tasks/partials/SingleTaskInProject.vue'
import DatepickerWithRange from '@/components/date/DatepickerWithRange.vue'
import XLabel from '@/components/tasks/partials/Label.vue'
import {DATE_RANGES} from '@/components/date/dateRanges'
import LlamaCool from '@/assets/llama-cool.svg?component'
import type {ITask} from '@/modelTypes/ITask'
import {useAuthStore} from '@/stores/auth'
import {useTaskStore} from '@/stores/tasks'
import {useProjectStore} from '@/stores/projects'
import {useLabelStore} from '@/stores/labels'
import type {TaskFilterParams} from '@/services/taskCollection'
import TaskCollectionService from '@/services/taskCollection'
import {PERMISSIONS} from '@/constants/permissions'
import {shouldShowTaskInListView, shouldShowTaskOnOverview} from '@/composables/useTaskListFiltering'
import {useTaskLay} from '@/composables/useTaskLay'
import {getProjectTitle, isDailyProject, isInboxProject} from '@/helpers/getProjectTitle'
import {useProjectIcon} from '@/composables/useProjectIcon'

const props = withDefaults(defineProps<{
	dateFrom?: Date | string,
	dateTo?: Date | string,
	showNulls?: boolean,
	showOverdue?: boolean,
	labelIds?: string[],
	overview?: boolean,
}>(), {
	showNulls: false,
	showOverdue: false,
	dateFrom: undefined,
	dateTo: undefined,
	labelIds: undefined,
	overview: false,
})

const emit = defineEmits<{
	'tasksLoaded': true,
	'clearLabelFilter': void,
}>()

const authStore = useAuthStore()
const taskStore = useTaskStore()
const projectStore = useProjectStore()
const labelStore = useLabelStore()

const route = useRoute()
const router = useRouter()
const {t} = useI18n({useScope: 'global'})
const {iconFor} = useProjectIcon()

const tasks = ref<ITask[]>([])
const showNothingToDo = ref<boolean>(false)
const taskCollectionService = ref(new TaskCollectionService())

setTimeout(() => showNothingToDo.value = true, 100)

const showAll = computed(() => typeof props.dateFrom === 'undefined' || typeof props.dateTo === 'undefined')

const filteredLabels = computed(() => {
	if (!props.labelIds || props.labelIds.length === 0) {
		return []
	}
	return props.labelIds
		.map(id => labelStore.getLabelById(Number(id)))
		.filter(label => label !== null && label !== undefined)
})

const savedFilterIgnored = computed(() => {
	return filteredLabels.value.length > 0
		&& filterIdUsedOnOverview.value
		&& typeof projectStore.projects[filterIdUsedOnOverview.value] !== 'undefined'
})

const pageTitle = computed(() => {
	// We need to define "key" because it is the first parameter in the array and we need the second
	const predefinedRange = Object.entries(DATE_RANGES)
		.find(([, value]) => props.dateFrom === value[0] && props.dateTo === value[1])
		?.[0]
	if (typeof predefinedRange !== 'undefined') {
		return t(`input.datepickerRange.ranges.${predefinedRange}`)
	}

	return showAll.value
		? t('task.show.titleCurrent')
		: t('task.show.fromuntil', {
			from: formatDate(props.dateFrom, 'LL'),
			until: formatDate(props.dateTo, 'LL'),
		})
})
const visibleTasks = computed(() => {
	return tasks.value.filter(task => {
		if (props.overview) {
			const project = projectStore.projects[task.projectId]
			return shouldShowTaskOnOverview(task, isInboxProject(project), isDailyProject(project))
		}
		return shouldShowTaskInListView(task)
	})
})

const overviewGroups = computed(() => {
	const groups = new Map<number, ITask[]>()
	for (const task of visibleTasks.value) {
		const existing = groups.get(task.projectId)
		if (existing) {
			existing.push(task)
		} else {
			groups.set(task.projectId, [task])
		}
	}

	return [...groups.entries()]
		.map(([projectId, groupedTasks]) => {
			const project = projectStore.projects[projectId]
			return {
				projectId,
				project,
				title: project ? getProjectTitle(project) : String(projectId),
				isInbox: isInboxProject(project),
				isDaily: isDailyProject(project),
				tasks: groupedTasks,
			}
		})
		.sort((a, b) => {
			if (a.isDaily !== b.isDaily) {
				return a.isDaily ? -1 : 1
			}
			if (a.isInbox !== b.isInbox) {
				return a.isInbox ? -1 : 1
			}
			return a.title.localeCompare(b.title)
		})
})
const hasTasks = computed(() => visibleTasks.value.length > 0)
const userAuthenticated = computed(() => authStore.authenticated)
const loading = computed(() => taskStore.isLoading || taskCollectionService.value.loading)
const {isLaying} = useTaskLay(
	() => !loading.value && hasTasks.value,
	() => route.name,
)
const filterIdUsedOnOverview = computed(() => authStore.settings?.frontendSettings?.filterIdUsedOnOverview)

interface dateStrings {
	dateFrom: string,
	dateTo: string,
}

function setDate(dates: dateStrings) {
	router.push({
		name: route.name as string,
		query: {
			from: dates.dateFrom ?? props.dateFrom,
			to: dates.dateTo ?? props.dateTo,
			showOverdue: props.showOverdue ? 'true' : 'false',
			showNulls: props.showNulls ? 'true' : 'false',
		},
	})
}

function setShowOverdue(show: boolean) {
	router.push({
		name: route.name as string,
		query: {
			...route.query,
			showOverdue: show ? 'true' : 'false',
		},
	})
}

function setShowNulls(show: boolean) {
	router.push({
		name: route.name as string,
		query: {
			...route.query,
			showNulls: show ? 'true' : 'false',
		},
	})
}

function clearLabelFilter() {
	emit('clearLabelFilter')
}

async function loadPendingTasks(from: Date|string, to: Date|string, filterId: number | null | undefined) {
	// FIXME: HACK! This should never happen.
	// Since this route is authentication only, users would get an error message if they access the page unauthenticated.
	// Since this component is mounted as the home page before unauthenticated users get redirected
	// to the login page, they will almost always see the error message.
	if (!userAuthenticated.value) {
		return
	}

	const params: TaskFilterParams = {
		sort_by: ['due_date', 'id'],
		order_by: ['asc', 'desc'],
		filter: 'done = false',
		filter_include_nulls: props.showNulls,
		s: '',
		expand: ['comment_count', 'is_unread'],
	}

	if (!showAll.value) {

		params.filter += ` && due_date < '${to instanceof Date ? to.toISOString() : to}'`

		// NOTE: Ideally we could also show tasks with a start or end date in the specified range, but the api
		//       is not capable (yet) of combining multiple filters with 'and' and 'or'.

		if (!props.showOverdue) {
			params.filter += ` && due_date > '${from instanceof Date ? from.toISOString() : from}'`
		}
	}

	// Add label filtering
	if (props.labelIds && props.labelIds.length > 0) {
		const labelFilter = `labels in ${props.labelIds.join(', ')}`
		params.filter += params.filter ? ` && ${labelFilter}` : labelFilter
	}

	let projectId = null
	if (showAll.value && filterId && typeof projectStore.projects[filterId] !== 'undefined'
		&& (!props.labelIds || props.labelIds.length === 0)) {
		projectId = filterId
	}

	tasks.value = await taskStore.loadTasks(params, projectId)
	emit('tasksLoaded', true)
}

// FIXME: this modification should happen in the store
function updateTasks(updatedTask: ITask) {
	for (let t = 0; t < tasks.value.length; t++) {
		if (tasks.value[t].id === updatedTask.id) {
			tasks.value[t] = updatedTask
			// Move the task to the end of the done tasks if it is now done
			if (updatedTask.done) {
				tasks.value.splice(t, 1)
				tasks.value.push(updatedTask)
			}
			break
		}
	}
}

// Use watch instead of watchEffect to prevent reloading tasks when unrelated settings change.
// watchEffect would track all reactive dependencies accessed inside loadPendingTasks,
// which includes the entire settings object. When sidebarWidth changes, the settings
// object is replaced, triggering the watchEffect even though filterIdUsedOnOverview
// hasn't changed. Using watch with explicit dependencies and immediate:true gives us
// the same behavior but only triggers when these specific values actually change.
watch(
	[() => props.dateFrom, () => props.dateTo, filterIdUsedOnOverview],
	([from, to, filterId]) => loadPendingTasks(from, to, filterId),
	{immediate: true},
)
watchEffect(() => {
	if (!props.overview) {
		setTitle(pageTitle.value)
	}
})
</script>

<style lang="scss" scoped>
.tasks {
	list-style: none;
	margin: 0;
}

.overview-project {
	margin-block-end: 1.5rem;
	padding-block-end: 1.25rem;
	border-block-end: 1px solid var(--card-border-color);

	&:last-child {
		margin-block-end: 0;
		padding-block-end: 0;
		border-block-end: 0;
	}
}

.overview-project-title {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin: 0 0 0.5rem;
	font-family: $vikunja-font;
	font-size: 0.95rem;
	font-weight: 650;
	letter-spacing: -0.02em;
	color: var(--grey-900);
}

.overview-project-glyph {
	display: flex;
	align-items: center;
	justify-content: center;
	inline-size: 1.15rem;
	block-size: 1.15rem;
	flex-shrink: 0;
	border-radius: $radius;
	background: var(--white);
	border: 1px solid var(--card-border-color);
	color: var(--grey-700);

	:deep(svg) {
		inline-size: 0.7rem;
		block-size: 0.7rem;
	}
}

.overview-tasks {
	list-style: none;
	margin: 0;
	padding: 0;
	background: var(--white);
	border: 1px solid var(--card-border-color);
	border-radius: $radius;

	li + li {
		border-block-start: 1px solid var(--card-border-color);
	}

	:deep(.single-task) {
		padding: 0.55rem 0.75rem;
	}

	:deep(.task-link) {
		font-family: $family-sans-serif;
		font-size: 0.95rem;
		color: var(--grey-900);
	}
}

.show-tasks-options {
	display: flex;
	flex-direction: column;
}

.llama-cool {
	margin: 3rem auto 0;
	display: block;
}

.label-filter-info {
	margin-block-end: 1rem;
	
	.clear-filter-button {
		margin-inline-start: auto;
		padding: 0.25rem 0.5rem;
		
		&:hover {
			color: var(--danger-text);
		}
	}

	:deep(.message.info) {
		inline-size: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
}
</style>
