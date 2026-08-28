<template>
	<div class="home-surface">
		<h1
			v-if="salutation"
			class="home-salutation"
		>
			<template
				v-for="(part, i) in salutationParts"
				:key="i"
			>
				<span
					v-if="part.isName"
					class="home-salutation__name"
				>{{ part.text }}</span>
				<template v-else>
					{{ part.text }}
				</template>
			</template>
		</h1>

		<Message
			v-if="deletionScheduledAt !== null"
			variant="danger"
			class="mbe-4"
		>
			{{
				$t('user.deletion.scheduled', {
					date: formatDisplayDate(deletionScheduledAt),
					dateSince: formatDateSince(deletionScheduledAt),
				})
			}}
			<RouterLink :to="{name: 'user.settings.deletion'}">
				{{ $t('user.deletion.scheduledCancel') }}
			</RouterLink>
		</Message>
		<AddTask
			hero
			class="home-add-task"
			@tasksAdded="updateTaskKey"
		/>
		<ImportHint v-if="tasksLoaded" />
		<ShowTasks
			v-if="projectStore.hasProjects"
			:key="showTasksKey"
			:label-ids="labelIds"
			overview
			class="show-tasks"
			@tasksLoaded="tasksLoaded = true"
			@clearLabelFilter="handleClearLabelFilter"
		/>
	</div>
</template>

<script lang="ts" setup>
import {ref, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'

import Message from '@/components/misc/Message.vue'
import ShowTasks from '@/views/tasks/ShowTasks.vue'
import AddTask from '@/components/tasks/AddTask.vue'
import ImportHint from '@/components/home/ImportHint.vue'

import {parseDateOrNull} from '@/helpers/parseDateOrNull'
import {formatDateSince, formatDisplayDate} from '@/helpers/time/formatDate'
import {useDaytimeSalutation} from '@/composables/useDaytimeSalutation'

import {useProjectStore} from '@/stores/projects'
import {useAuthStore} from '@/stores/auth'

const salutation = useDaytimeSalutation()

const authStore = useAuthStore()
const projectStore = useProjectStore()
const route = useRoute()
const router = useRouter()

const salutationParts = computed(() => {
	const text = salutation.value
	const name = authStore.userDisplayName
	if (!text || !name) {
		return []
	}
	const idx = text.indexOf(name)
	if (idx < 0) {
		return [{text, isName: false}]
	}
	return [
		{text: text.slice(0, idx), isName: false},
		{text: name, isName: true},
		{text: text.slice(idx + name.length), isName: false},
	]
})

const tasksLoaded = ref(false)

const deletionScheduledAt = computed(() => parseDateOrNull(authStore.info?.deletionScheduledAt))

// Extract label IDs from query parameter
const labelIds = computed(() => {
	const labelsParam = route.query.labels
	if (!labelsParam) {
		return undefined
	}
	return Array.isArray(labelsParam) ? labelsParam : [labelsParam]
})

// This is to reload the tasks list after adding a new task through the global task add.
// FIXME: Should use pinia (somehow?)
const showTasksKey = ref(0)

function updateTaskKey() {
	showTasksKey.value++
}

function handleClearLabelFilter() {
	const query = {...route.query}
	delete query.labels
	router.push({
		name: route.name as string,
		query,
	})
}
</script>

<style scoped lang="scss">
.home-surface {
	max-inline-size: $desktop;
	margin-inline: auto;
}

.home-salutation {
	text-align: start;
	margin-block-end: 1.5rem;
	padding-block-end: 1rem;
	border-block-end: 1px solid var(--card-border-color);
	font-size: 1.5rem;
	font-weight: 650;
	letter-spacing: -0.02em;
}

.home-salutation__name {
	color: #e24e1b;
}

.home-add-task {
	margin-block-end: 0;
}

.show-tasks {
	margin-block-start: 2rem;
	margin-inline: auto;
	text-align: start;
}
</style>
