<template>
	<aside
		:class="{'is-active': baseStore.menuActive, 'is-resizing': isResizing}"
		class="menu-container"
		:style="{'--sidebar-width': sidebarWidth}"
	>
		<div class="menu-scroll">
			<nav
				class="menu top-menu"
				:aria-label="$t('navigation.main')"
			>
				<menu class="menu-list other-menu-items">
					<li>
						<RouterLink
							v-shortcut="SHORTCUTS.navigation.overview"
							:to="{ name: 'home'}"
						>
							<span class="menu-item-icon icon">
								<Icon icon="calendar" />
							</span>
							{{ $t('navigation.overview') }}
						</RouterLink>
					</li>
					<li>
						<RouterLink
							v-shortcut="SHORTCUTS.navigation.upcoming"
							:to="{ name: 'tasks.range'}"
						>
							<span class="menu-item-icon icon">
								<Icon :icon="['far', 'calendar-alt']" />
							</span>
							{{ $t('navigation.upcoming') }}
						</RouterLink>
					</li>
					<li v-if="timeTrackingEnabled">
						<RouterLink :to="{ name: 'time-tracking'}">
							<span class="menu-item-icon icon">
								<Icon :icon="['far', 'clock']" />
							</span>
							{{ $t('timeTracking.title') }}
						</RouterLink>
					</li>
				</menu>
			</nav>

			<Loading
				v-if="projectStore.isLoading"
				variant="small"
			/>
			<template v-else>
				<nav
					v-if="savedFilterProjects.length"
					class="menu"
					:aria-label="$t('navigation.savedFilters')"
				>
					<ProjectsNavigation
						:model-value="savedFilterProjects"
						:can-edit-order="false"
						:can-collapse="false"
					/>
				</nav>

				<nav
					class="menu"
					:aria-label="$t('project.projects')"
				>
					<ProjectsNavigation
						:model-value="projects"
						:can-edit-order="true"
						:can-collapse="true"
					/>
					<menu class="menu-list">
						<li>
							<RouterLink
								class="new-project-link"
								:to="{ name: 'project.create' }"
							>
								<span class="menu-item-icon icon">
									<Icon icon="plus" />
								</span>
								{{ $t('project.create.header') }}
							</RouterLink>
						</li>
						<li>
							<RouterLink :to="{ name: 'filters.create' }">
								<span class="menu-item-icon icon">
									<Icon icon="filter" />
								</span>
								{{ $t('filters.create.title') }}
							</RouterLink>
						</li>
					</menu>
				</nav>
			</template>
		</div>

		<div class="menu-footer d-print-none">
			<BaseButton
				v-shortcut="SHORTCUTS.showKeyboardShortcuts"
				class="keyboard-shortcuts-button"
				@click="baseStore.setKeyboardShortcutsActive(true)"
			>
				<span class="is-sr-only">{{ $t('keyboardShortcuts.title') }}</span>
				<Icon icon="keyboard" />
			</BaseButton>
		</div>

		<div
			v-if="!isMobile"
			class="resize-handle"
			@mousedown="startResize"
			@touchstart="startResize"
		/>
	</aside>
</template>

<script setup lang="ts">
import {computed} from 'vue'

import {SHORTCUTS} from '@/constants/shortcuts'
import Loading from '@/components/misc/Loading.vue'
import BaseButton from '@/components/base/BaseButton.vue'

import {useBaseStore} from '@/stores/base'
import {useProjectStore} from '@/stores/projects'
import {useConfigStore} from '@/stores/config'
import {PRO_FEATURE} from '@/constants/proFeatures'
import ProjectsNavigation from '@/components/home/ProjectsNavigation.vue'
import type {IProject} from '@/modelTypes/IProject'
import {useSidebarResize} from '@/composables/useSidebarResize'

const baseStore = useBaseStore()
const projectStore = useProjectStore()
const configStore = useConfigStore()

const timeTrackingEnabled = computed(() => configStore.isProFeatureEnabled(PRO_FEATURE.TIME_TRACKING))

const {sidebarWidth, isResizing, startResize, isMobile} = useSidebarResize()

// Cast readonly arrays to mutable type - the arrays are not actually mutated by the component
const projects = computed(() => projectStore.notArchivedRootProjects as IProject[])
const savedFilterProjects = computed(() => projectStore.savedFilterProjects as IProject[])
</script>

<style lang="scss" scoped>
.menu-container {
	--sidebar-width: #{$navbar-width};
	--menu-nested-list-margin: 0.85rem;

	display: flex;
	flex-direction: column;
	background: var(--rail-bg);
	color: var(--rail-ink);
	padding: 0.85rem 0.65rem 0.75rem;
	transition: transform $transition-duration $ease-out-expo;
	position: fixed;
	inset-block-start: $navbar-height;
	inset-block-end: 0;
	inset-inline-start: 0;
	inline-size: var(--sidebar-width);
	overflow: hidden;
	z-index: 20;

	@media screen and (max-width: $tablet) {
		inset-block-start: 0;
		inline-size: 16rem;
		transform: translateX(-100%);

		[dir="rtl"] & {
			transform: translateX(100%);
		}

		&.is-active {
			transform: translateX(0);
		}
	}

	&.is-resizing {
		transition: none;
	}
}

.resize-handle {
	position: absolute;
	inset-block-start: 0;
	inset-block-end: 0;
	inset-inline-end: 0;
	inline-size: 4px;
	cursor: ew-resize;
	background: transparent;
	transition: background-color $transition-duration ease;
	touch-action: none;

	&:hover,
	&:active {
		background-color: var(--primary);
	}
}

.top-menu .menu-list {
	li {
		font-weight: 600;
		font-family: $vikunja-font;
		min-inline-size: 0;
	}

	.list-menu-link,
	li > a {
		padding-inline-start: 0.45rem;
		display: flex;
		align-items: center;
		min-inline-size: 0;
		inline-size: 100%;

		.icon {
			padding-block-end: 0;
			flex-shrink: 0;
		}
	}
}

.menu + .menu {
	padding-block-start: 0.6rem;
	margin-block-start: 0.6rem;
	border-block-start: 1px solid var(--rail-line);
}

.new-project-link {
	margin-block-start: 0.25rem;
}

.menu-scroll {
	flex: 1 1 auto;
	min-block-size: 0;
	overflow-x: hidden;
	overflow-y: auto;
}

.menu-footer {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	padding-block-start: 0.65rem;
}

.keyboard-shortcuts-button {
	inline-size: 2rem;
	min-inline-size: 2rem;
	block-size: 2rem;
	padding: 0;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	color: var(--rail-muted);
	transition: color $transition;

	&:hover,
	&:focus-visible {
		color: var(--rail-ink);
	}
}
</style>
