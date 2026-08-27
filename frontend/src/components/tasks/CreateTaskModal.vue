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
				<p class="help">
					{{ $t('task.createModal.intro') }}
				</p>

				<FormField
					v-slot="{ id, describedBy }"
					:label="$t('task.attributes.title')"
					:error="titleError"
				>
					<input
						:id="id"
						v-model="title"
						v-focus
						class="input"
						type="text"
						required
						:placeholder="$t('task.createModal.titlePlaceholder')"
						:aria-invalid="titleError ? true : undefined"
						:aria-describedby="describedBy"
						@input="titleError = null"
					>
				</FormField>

				<FormField
					v-slot="{ id, describedBy }"
					:label="$t('task.attributes.project')"
					:error="projectError"
				>
					<div class="select is-fullwidth">
						<select
							:id="id"
							v-model.number="selectedProjectId"
							required
							:aria-invalid="projectError ? true : undefined"
							:aria-describedby="describedBy"
							@change="projectError = null"
						>
							<option
								disabled
								:value="0"
							>
								{{ $t('task.createModal.chooseProject') }}
							</option>
							<option
								v-for="project in selectableProjects"
								:key="project.id"
								:value="project.id"
							>
								{{ project.title }}
							</option>
						</select>
					</div>
				</FormField>

				<FormField :label="$t('task.attributes.labels')">
					<EditLabels
						v-model="selectedLabels"
						:task-id="0"
					/>
				</FormField>

				<FormField
					v-slot="{ id }"
					:label="$t('task.attributes.description')"
				>
					<textarea
						:id="id"
						v-model="description"
						class="textarea"
						rows="4"
						:placeholder="$t('task.description.placeholder')"
					/>
				</FormField>

				<FormField :label="$t('task.attributes.priority')">
					<PrioritySelect v-model="priority" />
				</FormField>

				<FormField
					:label="$t('task.attributes.percentDone')"
					:hint="$t('task.createModal.progressHint')"
				>
					<PercentDoneSelect v-model="percentDone" />
				</FormField>

				<p class="help">
					{{ $t('task.createModal.datesHint') }}
				</p>

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
import EditLabels from '@/components/tasks/partials/EditLabels.vue'

import {PRIORITIES} from '@/constants/priorities'
import {getProjectTitle} from '@/helpers/getProjectTitle'
import {taskDetailLocation} from '@/helpers/taskDetailBackdrop'
import {error, success} from '@/message'
import type {ILabel} from '@/modelTypes/ILabel'
import type {ITask} from '@/modelTypes/ITask'
import {useAuthStore} from '@/stores/auth'
import {useLabelStore} from '@/stores/labels'
import {useProjectStore} from '@/stores/projects'
import {useTaskStore} from '@/stores/tasks'

const props = withDefaults(defineProps<{
	open: boolean
	projectId?: number | null
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
const labelStore = useLabelStore()
const taskStore = useTaskStore()

const title = ref('')
const description = ref('')
const priority = ref(PRIORITIES.UNSET)
const percentDone = ref(0)
const dueDate = ref<Date | null>(null)
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const selectedProjectId = ref(0)
const selectedLabels = ref<ILabel[]>([])

const loading = computed(() => taskStore.isLoading)

const selectableProjects = computed(() => {
	const result: {id: number, title: string}[] = []

	function walk(parentId: number, depth: number) {
		const children = parentId === 0
			? [...projectStore.notArchivedRootProjects]
			: projectStore.getChildProjects(parentId).filter(p => !p.isArchived && p.id > 0)

		for (const project of children) {
			const prefix = depth > 0 ? `${'\u2014 '.repeat(depth)}` : ''
			result.push({
				id: project.id,
				title: `${prefix}${getProjectTitle(project)}`,
			})
			walk(project.id, depth + 1)
		}
	}

	walk(0, 0)
	return result
})

const titleError = ref<string | null>(null)
const projectError = ref<string | null>(null)

function validate(): boolean {
	titleError.value = title.value.trim() === '' ? t('task.detail.titleRequired') : null
	projectError.value = selectedProjectId.value > 0 ? null : t('task.createModal.chooseProject')
	return titleError.value === null && projectError.value === null
}

function toDate(value: Date | string | null | undefined): Date | null {
	if (!value) {
		return null
	}
	const date = value instanceof Date ? value : new Date(value)
	return Number.isNaN(date.getTime()) ? null : date
}

function initialProjectId() {
	if (props.projectId && props.projectId > 0) {
		return props.projectId
	}
	const fromRoute = Number(router.currentRoute.value.params.projectId)
	if (fromRoute > 0) {
		return fromRoute
	}
	return authStore.settings.defaultProjectId || 0
}

function reset() {
	title.value = props.defaultTitle
	description.value = ''
	priority.value = PRIORITIES.UNSET
	percentDone.value = 0
	dueDate.value = null
	startDate.value = toDate(props.defaultStartDate)
	endDate.value = toDate(props.defaultEndDate)
	selectedProjectId.value = initialProjectId()
	selectedLabels.value = []
	titleError.value = null
	projectError.value = null
}

watch(() => props.open, (open) => {
	if (open) {
		reset()
		labelStore.loadAllLabels()
	}
})

function close() {
	emit('close')
}

async function submit() {
	if (loading.value || !validate()) {
		return
	}

	const projectId = selectedProjectId.value

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

		for (const label of selectedLabels.value) {
			await taskStore.addLabel({label, taskId: task.id})
		}

		success({message: t('task.createSuccess'), title: false})
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

.select {
	inline-size: 100%;

	select {
		inline-size: 100%;
	}
}
</style>
