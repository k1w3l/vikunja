<template>
	<Modal
		:enabled="open"
		wide
		overflow
		@close="close"
	>
		<div class="modal-header">
			<span>{{ $t('task.createModal.title') }}</span>
		</div>
		<div class="content">
			<form
				class="create-task-form"
				@submit.prevent="submit"
			>
				<FormField :label="$t('task.attributes.title')">
					<input
						v-model="title"
						v-focus
						class="input"
						type="text"
						required
					>
				</FormField>

				<FormField
					v-if="!fixedProjectId"
					:label="$t('task.attributes.project')"
				>
					<ProjectSearch v-model="selectedProject" />
				</FormField>

				<FormField :label="$t('task.attributes.description')">
					<textarea
						v-model="description"
						class="textarea"
						rows="4"
					/>
				</FormField>

				<FormField :label="$t('task.attributes.priority')">
					<PrioritySelect v-model="priority" />
				</FormField>

				<FormField :label="$t('task.attributes.percentDone')">
					<PercentDoneSelect v-model="percentDone" />
				</FormField>

				<FormField :label="$t('task.attributes.dueDate')">
					<Datepicker
						v-model="dueDate"
						:choose-date-label="$t('task.detail.chooseDueDate')"
					/>
				</FormField>

				<FormField :label="$t('task.attributes.startDate')">
					<Datepicker
						v-model="startDate"
						:choose-date-label="$t('task.detail.chooseStartDate')"
					/>
				</FormField>

				<FormField :label="$t('task.attributes.endDate')">
					<Datepicker
						v-model="endDate"
						:choose-date-label="$t('task.detail.chooseEndDate')"
					/>
				</FormField>
			</form>
		</div>
		<div class="actions">
			<XButton
				variant="tertiary"
				@click="close"
			>
				{{ $t('misc.cancel') }}
			</XButton>
			<XButton
				variant="primary"
				:shadow="false"
				:loading="loading"
				:disabled="!canSubmit"
				@click="submit"
			>
				{{ $t('task.createModal.submit') }}
			</XButton>
		</div>
	</Modal>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import {useRouter} from 'vue-router'

import Modal from '@/components/misc/Modal.vue'
import FormField from '@/components/input/FormField.vue'
import Datepicker from '@/components/input/Datepicker.vue'
import PrioritySelect from '@/components/tasks/partials/PrioritySelect.vue'
import PercentDoneSelect from '@/components/tasks/partials/PercentDoneSelect.vue'
import ProjectSearch from '@/components/tasks/partials/ProjectSearch.vue'

import {PRIORITIES} from '@/constants/priorities'
import {taskDetailLocation} from '@/helpers/taskDetailBackdrop'
import {error, success} from '@/message'
import type {IProject} from '@/modelTypes/IProject'
import type {ITask} from '@/modelTypes/ITask'
import ProjectModel from '@/models/project'
import {useAuthStore} from '@/stores/auth'
import {useProjectStore} from '@/stores/projects'
import {useTaskStore} from '@/stores/tasks'

const props = withDefaults(defineProps<{
	open: boolean
	projectId?: IProject['id'] | null
	bucketId?: number | null
	defaultTitle?: string
	defaultStartDate?: Date | string | null
	defaultEndDate?: Date | string | null
}>(), {
	projectId: null,
	bucketId: null,
	defaultTitle: '',
	defaultStartDate: null,
	defaultEndDate: null,
})

const emit = defineEmits<{
	close: []
	created: [task: ITask]
}>()

const {t} = useI18n({useScope: 'global'})
const router = useRouter()
const authStore = useAuthStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()

const title = ref('')
const description = ref('')
const priority = ref(PRIORITIES.UNSET)
const percentDone = ref(0)
const dueDate = ref<Date | null>(null)
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const selectedProject = ref<IProject>(new ProjectModel())

const loading = computed(() => taskStore.isLoading)
const fixedProjectId = computed(() => {
	if (props.projectId && props.projectId > 0) {
		return props.projectId
	}
	const fromRoute = Number(router.currentRoute.value.params.projectId)
	return fromRoute > 0 ? fromRoute : null
})

const canSubmit = computed(() => {
	if (title.value.trim() === '') {
		return false
	}
	if (fixedProjectId.value) {
		return true
	}
	return Boolean(selectedProject.value?.id)
})

function toDate(value: Date | string | null | undefined): Date | null {
	if (!value) {
		return null
	}
	const date = value instanceof Date ? value : new Date(value)
	return Number.isNaN(date.getTime()) ? null : date
}

function reset() {
	title.value = props.defaultTitle
	description.value = ''
	priority.value = PRIORITIES.UNSET
	percentDone.value = 0
	dueDate.value = null
	startDate.value = toDate(props.defaultStartDate)
	endDate.value = toDate(props.defaultEndDate)
	const projectId = fixedProjectId.value ?? authStore.settings.defaultProjectId
	const existing = projectId ? projectStore.projects[projectId] : undefined
	selectedProject.value = existing
		? new ProjectModel({...existing})
		: new ProjectModel(projectId ? {id: projectId} : {})
}

watch(() => props.open, (open) => {
	if (open) {
		reset()
	}
})

function close() {
	emit('close')
}

async function submit() {
	if (!canSubmit.value || loading.value) {
		return
	}

	const projectId = fixedProjectId.value
		|| selectedProject.value.id
		|| authStore.settings.defaultProjectId
		|| 0

	if (!projectId) {
		error({message: t('project.create.addProjectRequired')})
		return
	}

	try {
		let task = await taskStore.createNewTask({
			title: title.value.trim(),
			projectId,
			bucketId: props.bucketId || undefined,
		})

		const extra = {
			description: description.value,
			priority: priority.value,
			percentDone: percentDone.value,
			dueDate: dueDate.value,
			startDate: startDate.value,
			endDate: endDate.value,
		}

		const hasExtra = extra.description !== ''
			|| extra.priority !== PRIORITIES.UNSET
			|| extra.percentDone > 0
			|| extra.dueDate !== null
			|| extra.startDate !== null
			|| extra.endDate !== null

		if (hasExtra) {
			task = await taskStore.update({
				...task,
				...extra,
			})
		}

		success({message: t('task.createSuccess')})
		emit('created', task)
		close()
		await router.push(taskDetailLocation(task.id, router.currentRoute.value.fullPath))
	} catch (e) {
		error(e)
	}
}
</script>

<style scoped lang="scss">
.create-task-form {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	text-align: start;
}
</style>
