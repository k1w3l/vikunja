<template>
	<div
		class="task-add"
		:class="{'task-add--hero': hero}"
	>
		<XButton
			class="add-task-button"
			icon="plus"
			:loading="loading"
			:aria-label="$t('project.list.add')"
			@click="openCreateModal"
		>
			<span class="button-text">
				{{ $t('project.list.add') }}
			</span>
		</XButton>
		<CreateTaskModal
			:open="createModalOpen"
			:project-id="projectId"
			:bucket-id="bucketId"
			:default-start-date="defaultStartDate"
			:default-end-date="defaultEndDate"
			@close="createModalOpen = false"
			@created="onCreated"
		/>
	</div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'

import CreateTaskModal from '@/components/tasks/CreateTaskModal.vue'
import type {ITask} from '@/modelTypes/ITask'
import {useTaskStore} from '@/stores/tasks'

withDefaults(defineProps<{
	projectId?: number | null
	bucketId?: number | null
	defaultStartDate?: Date | string | null
	defaultEndDate?: Date | string | null
	hero?: boolean
}>(), {
	projectId: null,
	bucketId: null,
	defaultStartDate: null,
	defaultEndDate: null,
	hero: false,
})

const emit = defineEmits<{
	tasksAdded: [tasks: ITask[]],
}>()

const taskStore = useTaskStore()
const createModalOpen = ref(false)
const loading = computed(() => taskStore.isLoading)

function openCreateModal() {
	createModalOpen.value = true
}

function onCreated(task: ITask) {
	emit('tasksAdded', [task])
}

defineExpose({
	openCreateModal,
})
</script>

<style lang="scss" scoped>
.task-add {
	display: flex;
	align-items: center;
}

.task-add--hero {
	justify-content: center;

	.add-task-button {
		font-size: 1rem;
		min-block-size: 2.75rem;
		padding-inline: 1.25rem;
	}
}

@media screen and (max-width: $tablet) {
	.task-add:not(.task-add--hero) .button-text {
		display: none;
	}

	.task-add:not(.task-add--hero) :deep(.icon) {
		margin: 0 !important;
	}
}
</style>
