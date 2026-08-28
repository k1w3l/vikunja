<template>
	<div class="heading">
		<div class="heading-bar">
			<div
				v-if="$slots.meta"
				class="heading-meta"
			>
				<slot name="meta" />
			</div>
			<Done
				v-if="task.done && !$slots.actions"
				:is-done="task.done"
			/>
			<div class="heading-actions">
				<slot name="actions" />
				<BaseButton
					v-if="hasClose"
					:aria-label="$t('task.detail.closeTaskDetail')"
					class="close d-print-none"
					@click="$emit('close')"
				>
					<Icon icon="times" />
				</BaseButton>
			</div>
		</div>
		<h1
			class="title input"
			:class="{'disabled': !canWrite}"
			:title="task.title"
			:contenteditable="canWrite ? true : undefined"
			:tabindex="canWrite ? 0 : undefined"
			:aria-label="canWrite ? $t('task.attributes.title') : undefined"
			:spellcheck="false"
			@input="handleTitleInput"
			@blur="save($event.target as HTMLElement)"
			@keydown.enter.prevent.stop="!$event.isComposing && ($event.target as HTMLInputElement).blur()"
			@keydown.esc.prevent.stop="!$event.isComposing && cancel($event.target as HTMLInputElement)"
		>
			{{ task.title.trim() }}
		</h1>
		<CustomTransition name="fade">
			<span
				v-if="loading && saving"
				class="is-inline-flex is-align-items-center"
			>
				<span class="loader is-inline-block mie-2" />
				{{ $t('misc.saving') }}
			</span>
			<span
				v-else-if="!loading && showSavedMessage"
				class="has-text-success is-inline-flex is-align-content-center"
			>
				<Icon
					icon="check"
					class="mie-2"
				/>
				{{ $t('misc.saved') }}
			</span>
		</CustomTransition>
	</div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onBeforeUnmount, watch} from 'vue'
import {useI18n} from 'vue-i18n'

import {error} from '@/message'
import BaseButton from '@/components/base/BaseButton.vue'
import CustomTransition from '@/components/misc/CustomTransition.vue'
import Done from '@/components/misc/Done.vue'

import {useTaskStore} from '@/stores/tasks'

import type {ITask} from '@/modelTypes/ITask'

const props = defineProps<{
	task: ITask,
	canWrite: boolean,
	hasClose: boolean,
}>()

const emit = defineEmits<{
	'update:task': [task: ITask],
	'close': [],
}>()

const {t} = useI18n({useScope: 'global'})

const taskStore = useTaskStore()
const loading = computed(() => taskStore.isLoading)

const saving = ref(false)

const showSavedMessage = ref(false)

const titleHasChanges = ref(false)

function handleBeforeUnload(e: BeforeUnloadEvent) {
	if (titleHasChanges.value) {
		e.preventDefault()
		e.returnValue = ''
		return ''
	}
}

onMounted(() => {
	window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
	window.removeEventListener('beforeunload', handleBeforeUnload)
})

watch(() => props.task.id, () => {
	titleHasChanges.value = false
})

function handleTitleInput(event: Event) {
	const target = event.target as HTMLInputElement
	titleHasChanges.value = target.textContent !== props.task.title
}

async function save(element: HTMLElement) {
	const title = element.textContent ?? ''

	if (title.trim() === '') {
		element.textContent = props.task.title
		titleHasChanges.value = false
		error({message: t('task.detail.titleRequired')})
		return
	}

	if (title === props.task.title) {
		return
	}

	try {
		saving.value = true
		const newTask = await taskStore.update({
			...props.task,
			title,
		})
		emit('update:task', newTask)
		titleHasChanges.value = false
		showSavedMessage.value = true
		setTimeout(() => {
			showSavedMessage.value = false
		}, 2000)
	} finally {
		saving.value = false
	}
}

async function cancel(element: HTMLInputElement) {
	element.textContent = props.task.title
	titleHasChanges.value = false
	element.blur()
}
</script>

<style lang="scss" scoped>
.heading {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	justify-content: flex-start;
	text-transform: none;
	min-inline-size: 0;
	gap: 0.4rem;
	padding-block-start: 0;
}

.heading-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
	min-inline-size: 0;
	min-block-size: 2rem;
}

.heading-meta {
	display: flex;
	align-items: center;
	min-inline-size: 0;
	flex: 1 1 auto;
}

.heading-actions {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 0.25rem;
	flex-shrink: 0;
	margin-inline-start: auto;
}

.title {
	margin-block-end: 0;
}

.title.input {
	display: block;
	min-block-size: calc(1.8rem * 1.125 + .6rem + 2px);
	min-inline-size: 0;
	max-inline-size: 100%;
	margin-block-start: 0.2rem;
	margin-inline: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: var(--primary);
	text-align: center;

	&:focus {
		white-space: normal;
		overflow: visible;
		text-overflow: unset;
		text-align: start;
	}

	@media screen and (max-width: $tablet) {
		margin: 0.35rem -.3rem .5rem;
	}
}

.close {
	font-size: 2rem;
	margin-inline-start: 0.25rem;
	line-height: 1;

	@media screen and (max-width: $tablet) {
		display: none;
	}

	@media screen and (min-width: #{$desktop + 1px}) {
		display: none;
	}
}
</style>
