<template>
	<template v-if="kanbanView">
		<span
			v-if="!compact"
			class="inspector-crumb__sep"
		>›</span>
		<template v-if="canWrite">
			<Dropdown>
				<template #trigger="{toggleOpen, open}">
					<BaseButton
						class="bucket-name"
						:aria-expanded="open"
						:aria-label="$t('task.detail.bucketSelectLabel', {bucket: currentBucketTitle})"
						@click="toggleOpen"
					>
						<Icon
							icon="chevron-down"
							class="bucket-chevron d-print-none"
							:class="{'is-open': open}"
						/>
						{{ currentBucketTitle }}
					</BaseButton>
				</template>
				<template #default="{close}">
					<DropdownItem
						v-for="bucket in buckets"
						:key="bucket.id"
						:class="{'is-active': currentBucket?.id === bucket.id}"
						@click="changeBucket(bucket, close)"
					>
						{{ bucket.title }}
					</DropdownItem>
				</template>
			</Dropdown>
		</template>
		<span
			v-else
			class="bucket-name"
		>
			{{ currentBucketTitle }}
		</span>
	</template>
</template>

<script lang="ts" setup>
import {ref, computed, watch} from 'vue'
import {useI18n} from 'vue-i18n'

import type {ITask} from '@/modelTypes/ITask'
import type {IBucket} from '@/modelTypes/IBucket'

import {PROJECT_VIEW_KINDS} from '@/modelTypes/IProjectView'

import {useProjectStore} from '@/stores/projects'
import {useKanbanStore} from '@/stores/kanban'
import {useBaseStore} from '@/stores/base'

import BaseButton from '@/components/base/BaseButton.vue'
import Dropdown from '@/components/misc/Dropdown.vue'
import DropdownItem from '@/components/misc/DropdownItem.vue'

import BucketService from '@/services/bucket'
import TaskBucketService from '@/services/taskBucket'
import TaskBucketModel from '@/models/taskBucket'

import {success} from '@/message'

const props = withDefaults(defineProps<{
	task: ITask
	canWrite: boolean
	compact?: boolean
}>(), {
	compact: false,
})

const emit = defineEmits<{
	'update:task': [task: ITask]
}>()

const {t} = useI18n({useScope: 'global'})

const projectStore = useProjectStore()
const kanbanStore = useKanbanStore()
const baseStore = useBaseStore()

const project = computed(() => projectStore.projects[props.task.projectId])

// If the project has exactly one manual kanban view, always use it.
// If there are multiple, only show the selector when the active view is one of them.
const kanbanView = computed(() => {
	if (!project.value?.views) {
		return null
	}

	const manualKanbanViews = project.value.views.filter(
		v => v.viewKind === PROJECT_VIEW_KINDS.KANBAN
			&& v.bucketConfigurationMode === 'manual',
	)

	if (manualKanbanViews.length === 1) {
		return manualKanbanViews[0]
	}

	if (manualKanbanViews.length > 1) {
		const activeViewId = baseStore.currentProjectViewId
		return manualKanbanViews.find(v => v.id === activeViewId) || null
	}

	return null
})

const buckets = ref<IBucket[]>([])

watch(
	() => kanbanView.value,
	async (view) => {
		if (!view) {
			buckets.value = []
			return
		}

		const bucketService = new BucketService()
		try {
			buckets.value = await bucketService.getAll({
				projectId: props.task.projectId,
				projectViewId: view.id,
			} as IBucket)
		} catch (e) {
			console.error('Failed to load buckets:', e)
		}
	},
	{immediate: true},
)

const currentBucket = computed(() => {
	if (!kanbanView.value) {
		return undefined
	}
	return props.task.buckets?.find(b => b.projectViewId === kanbanView.value.id)
})

const currentBucketTitle = computed(() => {
	return currentBucket.value?.title || t('task.detail.noBucket')
})

async function changeBucket(bucket: IBucket, close?: () => void) {
	close?.()
	if (!kanbanView.value || currentBucket.value?.id === bucket.id) {
		return
	}

	const taskBucketService = new TaskBucketService()
	const updatedTaskBucket = await taskBucketService.update(new TaskBucketModel({
		taskId: props.task.id,
		bucketId: bucket.id,
		projectViewId: kanbanView.value.id,
		projectId: props.task.projectId,
	}))

	const updatedBuckets = (props.task.buckets || []).map(b => {
		if (b.projectViewId === kanbanView.value.id) {
			return {...bucket}
		}
		return b
	})

	if (!updatedBuckets.find(b => b.projectViewId === kanbanView.value.id)) {
		updatedBuckets.push({...bucket})
	}

	kanbanStore.moveTaskToBucket(props.task, bucket.id)

	// Only pick up done state from the response since moving to/from the
	// done bucket can toggle it. Spreading the full response task would
	// overwrite fields like maxPermission that are not part of this endpoint.
	const updatedTask = {
		...props.task,
		done: updatedTaskBucket.task?.done ?? props.task.done,
		doneAt: updatedTaskBucket.task?.doneAt ?? props.task.doneAt,
		buckets: updatedBuckets,
		bucketId: bucket.id,
	}

	emit('update:task', updatedTask)

	success({message: t('task.detail.bucketChangedSuccess')})
}
</script>

<style lang="scss" scoped>
.inspector-crumb__sep {
	color: var(--grey-400);
}

.bucket-name {
	color: var(--text-muted);
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;

	&:hover {
		color: var(--primary);
	}
}

.bucket-chevron {
	font-size: .75em;
	color: var(--grey-400);
	transition: transform $transition;

	&.is-open {
		transform: rotate(-180deg);
	}
}

:deep(.dropdown) {
	display: inline;
}

:deep(.dropdown-trigger) {
	display: inline;
	padding: 0;
}
</style>
