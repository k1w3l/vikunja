<script setup lang="ts">
import {computed, onMounted, reactive, ref} from 'vue'
import {useI18n} from 'vue-i18n'

import ColorPicker from '@/components/input/ColorPicker.vue'
import FormField from '@/components/input/FormField.vue'
import {useTitle} from '@/composables/useTitle'
import {getRandomColorHex} from '@/helpers/color/randomColor'
import {success} from '@/message'
import LabelModel from '@/models/label'
import type {ILabel} from '@/modelTypes/ILabel'
import {useAuthStore} from '@/stores/auth'
import {useLabelStore} from '@/stores/labels'

defineOptions({name: 'UserSettingsLabels'})

const {t} = useI18n({useScope: 'global'})
useTitle(() => `${t('label.title')} - ${t('user.settings.title')}`)

const authStore = useAuthStore()
const labelStore = useLabelStore()
const userInfo = computed(() => authStore.info)

const showCreateForm = ref(false)
const editingId = ref<number | null>(null)
const draft = reactive({
	title: '',
	hexColor: '',
})
const createDraft = reactive({
	title: '',
	hexColor: getRandomColorHex(),
})
const createError = ref<string | null>(null)
const editError = ref<string | null>(null)
const showDeleteModal = ref(false)
const labelToDelete = ref<ILabel | undefined>(undefined)

onMounted(() => {
	labelStore.loadAllLabels()
})

function resetCreate() {
	createDraft.title = ''
	createDraft.hexColor = getRandomColorHex()
	createError.value = null
}

function startCreate() {
	cancelEdit()
	resetCreate()
	showCreateForm.value = true
}

function startEdit(label: ILabel) {
	showCreateForm.value = false
	editingId.value = label.id
	draft.title = label.title
	draft.hexColor = label.hexColor
	editError.value = null
}

function cancelEdit() {
	editingId.value = null
	editError.value = null
}

function askDelete(label: ILabel) {
	labelToDelete.value = label
	showDeleteModal.value = true
}

async function confirmDelete() {
	const label = labelToDelete.value
	showDeleteModal.value = false
	labelToDelete.value = undefined
	if (!label) {
		return
	}
	if (editingId.value === label.id) {
		cancelEdit()
	}
	await labelStore.deleteLabel(label)
}

async function saveEdit() {
	const title = draft.title.trim()
	if (title === '') {
		editError.value = t('label.create.titleRequired')
		return
	}
	const current = labelStore.labelsArray.find(l => l.id === editingId.value)
	if (!current) {
		return
	}
	await labelStore.updateLabel(new LabelModel({
		...current,
		title,
		hexColor: draft.hexColor,
		created: +current.created,
		updated: +current.updated,
	}))
	success({message: t('label.edit.success')})
	cancelEdit()
}

async function createLabel() {
	const title = createDraft.title.trim()
	if (title === '') {
		createError.value = t('label.create.titleRequired')
		return
	}
	createError.value = null
	await labelStore.createLabel(new LabelModel({
		title,
		hexColor: createDraft.hexColor,
	}))
	success({message: t('label.create.success')})
	showCreateForm.value = false
	resetCreate()
}
</script>

<template>
	<Card :title="$t('label.title')">
		<p class="mbe-4">
			{{ $t('label.description') }}
		</p>

		<div
			v-if="labelStore.labelsArray.length > 0"
			class="has-horizontal-overflow"
		>
			<table class="table">
				<thead>
					<tr>
						<th>{{ $t('label.attributes.color') }}</th>
						<th>{{ $t('label.attributes.title') }}</th>
						<th class="has-text-end">
							{{ $t('misc.actions') }}
						</th>
					</tr>
				</thead>
				<tbody>
					<template
						v-for="label in labelStore.labelsArray"
						:key="label.id"
					>
						<tr v-if="editingId === label.id">
							<td colspan="3">
								<form
									class="settings-inline-form"
									@submit.prevent="saveEdit"
								>
									<FormField
										v-model="draft.title"
										:label="$t('label.attributes.title')"
										:placeholder="$t('label.attributes.titlePlaceholder')"
										:error="editError"
										type="text"
									/>
									<FormField :label="$t('label.attributes.color')">
										<ColorPicker v-model="draft.hexColor" />
									</FormField>
									<div class="settings-inline-actions">
										<XButton
											variant="secondary"
											type="button"
											@click="cancelEdit"
										>
											{{ $t('misc.cancel') }}
										</XButton>
										<XButton
											variant="primary"
											type="submit"
											:loading="labelStore.isLoading"
										>
											{{ $t('misc.save') }}
										</XButton>
									</div>
								</form>
							</td>
						</tr>
						<tr v-else>
							<td>
								<span
									class="label-swatch"
									:style="{ background: label.hexColor || 'var(--grey-200)' }"
								/>
							</td>
							<td>{{ label.title }}</td>
							<td class="has-text-end">
								<template v-if="userInfo?.id === label.createdBy?.id">
									<XButton
										variant="secondary"
										class="mie-2"
										@click="startEdit(label)"
									>
										{{ $t('label.edit.header') }}
									</XButton>
									<XButton
										variant="secondary"
										@click="askDelete(label)"
									>
										{{ $t('misc.delete') }}
									</XButton>
								</template>
							</td>
						</tr>
					</template>
				</tbody>
			</table>
		</div>

		<p v-else>
			{{ $t('label.newCTA') }}
		</p>

		<form
			v-if="showCreateForm"
			class="settings-inline-form"
			@submit.prevent="createLabel"
		>
			<FormField
				v-model="createDraft.title"
				:label="$t('label.attributes.title')"
				:placeholder="$t('label.attributes.titlePlaceholder')"
				:error="createError"
				type="text"
			/>
			<FormField :label="$t('label.attributes.color')">
				<ColorPicker v-model="createDraft.hexColor" />
			</FormField>
			<div class="settings-inline-actions">
				<XButton
					variant="secondary"
					type="button"
					@click="showCreateForm = false"
				>
					{{ $t('misc.cancel') }}
				</XButton>
				<XButton
					variant="primary"
					type="submit"
					:loading="labelStore.isLoading"
				>
					{{ $t('label.create.header') }}
				</XButton>
			</div>
		</form>

		<XButton
			v-else
			icon="plus"
			class="mbe-4"
			@click="startCreate"
		>
			{{ $t('label.create.header') }}
		</XButton>

		<Modal
			:enabled="showDeleteModal"
			@close="showDeleteModal = false"
			@submit="confirmDelete"
		>
			<template #header>
				{{ $t('task.label.delete.header') }}
			</template>
			<template #text>
				<p>
					{{ $t('task.label.delete.text1') }}
					{{ $t('task.label.delete.text2') }}
				</p>
			</template>
		</Modal>
	</Card>
</template>

<style scoped lang="scss">
.label-swatch {
	display: inline-block;
	inline-size: 1rem;
	block-size: 1rem;
	border-radius: 2px;
	border: 1px solid var(--card-border-color);
	vertical-align: middle;
}

.settings-inline-form {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	margin-block: 0.5rem 1rem;
}

.settings-inline-actions {
	display: flex;
	justify-content: flex-end;
	gap: 0.5rem;
}
</style>
