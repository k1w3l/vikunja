<template>
	<div
		class="loader-container"
		:class="{
			'is-loading': isLoadingProject,
			'is-archived': currentProject?.isArchived,
		}"
	>
		<h1 class="project-title-print">
			{{ getProjectTitle(currentProject) }}
		</h1>

		<div
			ref="switchViewContainerRef"
			class="switch-view-container d-print-none"
			:class="{'is-justify-content-flex-end': views.length === 1}"
		>
			<!-- Dropdown mode when buttons overflow -->
			<Dropdown
				v-if="isOverflowing && views.length > 1"
				class="switch-view-dropdown"
			>
				<template #trigger="{ toggleOpen, open }">
					<BaseButton
						class="switch-view switch-view-dropdown-trigger"
						:aria-expanded="open"
						@click="toggleOpen"
					>
						{{ activeViewTitle }}
						<Icon
							icon="chevron-down"
							class="dropdown-icon"
						/>
					</BaseButton>
				</template>
				<template #default="{ close }">
					<div @click="close">
						<DropdownItem
							v-for="view in views"
							:key="view.id"
							:to="getViewRoute(view)"
							:class="{'is-active': view.id === viewId}"
						>
							{{ getViewTitle(view) }}
						</DropdownItem>
					</div>
				</template>
			</Dropdown>

			<!-- Inline buttons, hidden when overflowing but kept in DOM for width measurement -->
			<div
				v-if="views.length > 1"
				ref="switchViewRef"
				class="switch-view"
				:class="{'switch-view--hidden': isOverflowing || !overflowChecked}"
				:aria-hidden="isOverflowing || undefined"
			>
				<BaseButton
					v-for="view in views"
					:key="view.id"
					class="switch-view-button"
					:class="{'is-active': view.id === viewId}"
					:to="getViewRoute(view)"
					:tabindex="isOverflowing ? -1 : undefined"
				>
					{{ getViewTitle(view) }}
				</BaseButton>
			</div>
			<div class="project-chrome-title">
				<Dropdown
					v-if="canCustomizeIcon"
					class="project-icon-picker"
				>
					<template #trigger="{ toggleOpen, open }">
						<BaseButton
							class="project-chrome-icon"
							:aria-label="$t('project.chooseIcon')"
							:aria-expanded="open"
							@click="toggleOpen"
						>
							<Icon
								v-if="currentProject.id"
								:icon="iconFor(currentProject)"
							/>
						</BaseButton>
					</template>
					<template #default="{ close }">
						<div class="project-icon-grid">
							<BaseButton
								v-for="icon in PROJECT_ICONS"
								:key="String(icon)"
								class="project-icon-option"
								:class="{'is-active': String(iconFor(currentProject)) === String(icon)}"
								:aria-label="String(icon)"
								@click="selectIcon(icon); close()"
							>
								<Icon :icon="icon" />
							</BaseButton>
						</div>
					</template>
				</Dropdown>
				<span
					v-else
					class="project-chrome-icon is-static"
				>
					<Icon
						v-if="currentProject.id"
						:icon="iconFor(currentProject)"
					/>
				</span>
				<span class="project-chrome-name">
					{{ currentProject.title === '' ? $t('misc.loading') : getProjectTitle(currentProject) }}
				</span>
			</div>
			<slot name="header" />
		</div>
		<CustomTransition name="fade">
			<Message
				v-if="currentProject?.isArchived"
				variant="warning"
				class="mbe-4"
			>
				{{ $t('project.archivedMessage') }}
			</Message>
		</CustomTransition>

		<slot v-if="!isLoadingProject" />
	</div>
</template>

<script setup lang="ts">
import {computed, ref, watch, nextTick, onMounted} from 'vue'
import {useResizeObserver} from '@vueuse/core'
import {useI18n} from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import Dropdown from '@/components/misc/Dropdown.vue'
import DropdownItem from '@/components/misc/DropdownItem.vue'
import Icon from '@/components/misc/Icon'
import Message from '@/components/misc/Message.vue'
import CustomTransition from '@/components/misc/CustomTransition.vue'

import {getProjectTitle} from '@/helpers/getProjectTitle'
import {PROJECT_ICONS} from '@/helpers/projectNavIcon'
import {useProjectIcon} from '@/composables/useProjectIcon'
import {useTitle} from '@/composables/useTitle'
import {PERMISSIONS} from '@/constants/permissions'

import {useBaseStore} from '@/stores/base'
import {useProjectStore} from '@/stores/projects'
import {useViewFiltersStore} from '@/stores/viewFilters'

import type {IProject} from '@/modelTypes/IProject'
import type {IProjectView} from '@/modelTypes/IProjectView'

const props = defineProps<{
	isLoadingProject: boolean,
	projectId: IProject['id'],
	viewId: IProjectView['id'],
}>()

const {t} = useI18n()

const baseStore = useBaseStore()
const projectStore = useProjectStore()
const viewFiltersStore = useViewFiltersStore()

const switchViewContainerRef = ref<HTMLElement>()
const switchViewRef = ref<HTMLElement>()
const isOverflowing = ref(false)
const overflowChecked = ref(false)

function checkOverflow() {
	if (!switchViewRef.value || !switchViewContainerRef.value) {
		return
	}
	const buttonsWidth = switchViewRef.value.scrollWidth
	const containerWidth = switchViewContainerRef.value.clientWidth
	isOverflowing.value = buttonsWidth > containerWidth
	overflowChecked.value = true
}

onMounted(() => {
	checkOverflow()
})

useResizeObserver(switchViewContainerRef, () => {
	requestAnimationFrame(() => checkOverflow())
})

const {iconFor, setIcon} = useProjectIcon()

const currentProject = computed<IProject>(() => {
	return baseStore.currentProject || {
		id: 0,
		title: '',
		isArchived: false,
		maxPermission: null,
	}
})
useTitle(() => currentProject.value?.id ? getProjectTitle(currentProject.value) : '')

const canCustomizeIcon = computed(() => {
	const permission = currentProject.value.maxPermission
	return currentProject.value.id > 0
		&& permission !== null
		&& permission !== undefined
		&& permission > PERMISSIONS.READ
})

async function selectIcon(icon: (typeof PROJECT_ICONS)[number]) {
	await setIcon(currentProject.value.id, String(icon))
}

const views = computed(() => projectStore.projects[props.projectId]?.views)

const activeViewTitle = computed(() => {
	const activeView = views.value?.find((v: IProjectView) => v.id === props.viewId)
	return activeView ? getViewTitle(activeView) : ''
})

// Re-check overflow when views change
watch(views, () => {
	nextTick(() => checkOverflow())
})

function getViewTitle(view: IProjectView) {
	switch (view.title) {
		case 'List':
			return t('project.list.title')
		case 'Gantt':
			return t('project.gantt.title')
		case 'Table':
			return t('project.table.title')
		case 'Kanban':
			return t('project.kanban.title')
	}

	return view.title
}

function getViewRoute(view: IProjectView) {
	const storedQuery = viewFiltersStore.getViewQuery(view.id)
	return {
		name: 'project.view',
		params: {projectId: props.projectId, viewId: view.id},
		query: storedQuery,
	}
}
</script>

<style lang="scss" scoped>
.switch-view-container {
	position: relative;
	min-block-size: $switch-view-height;
	margin-block-end: 1rem;
	
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
	align-items: center;
	gap: 1rem;

	@media screen and (max-width: $tablet) {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		flex-direction: column;
	}
}

.project-chrome-title {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	min-inline-size: 0;
	max-inline-size: 100%;
}

.project-chrome-name {
	font-family: $vikunja-font;
	font-size: 1.5rem;
	font-weight: 650;
	letter-spacing: -0.02em;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.project-chrome-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	inline-size: 2rem;
	block-size: 2rem;
	border-radius: $radius;
	border: 1px solid var(--card-border-color);
	background: var(--white);
	color: var(--grey-800);
	flex-shrink: 0;

	&.is-static {
		pointer-events: none;
	}
}

.project-icon-grid {
	display: grid;
	grid-template-columns: repeat(4, 2rem);
	gap: 0.35rem;
	padding: 0.5rem;
}

.project-icon-option {
	display: flex;
	align-items: center;
	justify-content: center;
	inline-size: 2rem;
	block-size: 2rem;
	border-radius: $radius;

	&:hover,
	&.is-active {
		background: var(--grey-100);
		color: var(--primary);
	}
}

.filter-container,
:deep(.filter-container) {
	justify-self: end;
}

.switch-view {
	background: var(--surface-elevated, var(--white));
	display: inline-flex;
	border-radius: $radius;
	font-size: 0.85rem;
	box-shadow: none;
	border: 1px solid var(--card-border-color);
	padding: .25rem;
}

.switch-view--hidden {
	position: absolute;
	visibility: hidden;
	pointer-events: none;
	white-space: nowrap;
	inset-inline-start: 0;
	inset-inline-end: 0;
	overflow: hidden;
}

.switch-view-dropdown-trigger {
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	gap: .25rem;
	font-weight: bold;
	color: var(--switch-view-color);
	background: var(--switch-view-active-background);
}

.dropdown-icon {
	font-size: 0.85rem;
}

.switch-view-button {
	padding: .25rem .5rem;
	display: block;
	white-space: nowrap;
	border-radius: $radius;
	transition: color $transition, background-color $transition;

	&:not(:last-child) {
		margin-inline-end: .5rem;
	}

	&:hover {
		color: var(--switch-view-color);
		background: var(--switch-view-active-background);
	}

	&.is-active {
		color: var(--switch-view-color);
		background: var(--switch-view-active-background);
		font-weight: bold;
		box-shadow: var(--shadow-xs);
	}
}

// FIXME: this should be in notification and set via a prop
.is-archived .notification.is-warning {
	margin-block-end: 1rem;
}

.project-title-print {
	display: none;
	font-size: 1.75rem;
	text-align: center;
	margin-block-end: .5rem;

	@media print {
		display: block;
	}
}
</style>
