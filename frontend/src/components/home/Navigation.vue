<template>
	<aside
		id="nav-projects-sheet"
		:class="{'is-active': baseStore.menuActive, 'is-resizing': isResizing}"
		class="menu-container"
		:style="{'--sidebar-width': sidebarWidth}"
	>
		<BaseButton
			v-shortcut="SHORTCUTS.toggleMenu"
			class="is-sr-only"
			:aria-label="$t('keyboardShortcuts.toggleMenu')"
			@click="baseStore.toggleMenu()"
		/>
		<div class="menu-scroll">
			<nav
				v-if="!isMobile"
				class="menu top-menu"
				:aria-label="$t('navigation.main')"
			>
				<menu class="menu-list other-menu-items">
					<li>
						<RouterLink
							v-slot="{href, navigate, isExactActive}"
							:to="{ name: 'home'}"
							custom
						>
							<a
								v-shortcut="SHORTCUTS.navigation.overview"
								:href="href"
								:class="{'router-link-exact-active': isExactActive && !hasLabelFilter}"
								:aria-current="isExactActive && !hasLabelFilter ? 'page' : undefined"
								@click="navigate"
							>
								<span class="menu-item-icon icon">
									<Icon icon="calendar" />
								</span>
								{{ $t('navigation.overview') }}
							</a>
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
					aria-labelledby="nav-filters-heading"
				>
					<NavigationSection
						heading-id="nav-filters-heading"
						:title="$t('filters.title')"
					/>
					<ProjectsNavigation
						:model-value="savedFilterProjects"
						:can-edit-order="false"
						:can-collapse="false"
					/>
				</nav>

				<nav
					class="menu"
					aria-labelledby="nav-projects-heading"
				>
					<NavigationSection
						heading-id="nav-projects-heading"
						:title="$t('project.projects')"
						:create-to="{ name: 'project.create' }"
						:create-label="$t('project.create.header')"
						create-class="new-project-link"
					/>
					<ProjectsNavigation
						:model-value="projects"
						:can-edit-order="true"
						:can-collapse="true"
					/>
				</nav>

				<nav
					class="menu"
					aria-labelledby="nav-labels-heading"
				>
					<NavigationSection
						heading-id="nav-labels-heading"
						:title="$t('label.title')"
						:create-to="{ name: 'labels.create' }"
						:create-label="$t('label.create.header')"
					/>
					<LabelsNavigation />
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
import {useRoute} from 'vue-router'

import {SHORTCUTS} from '@/constants/shortcuts'
import Loading from '@/components/misc/Loading.vue'
import BaseButton from '@/components/base/BaseButton.vue'

import {useBaseStore} from '@/stores/base'
import {useProjectStore} from '@/stores/projects'
import {useConfigStore} from '@/stores/config'
import {PRO_FEATURE} from '@/constants/proFeatures'
import ProjectsNavigation from '@/components/home/ProjectsNavigation.vue'
import NavigationSection from '@/components/home/NavigationSection.vue'
import LabelsNavigation from '@/components/home/LabelsNavigation.vue'
import type {IProject} from '@/modelTypes/IProject'
import {useSidebarResize} from '@/composables/useSidebarResize'

const baseStore = useBaseStore()
const projectStore = useProjectStore()
const configStore = useConfigStore()

const timeTrackingEnabled = computed(() => configStore.isProFeatureEnabled(PRO_FEATURE.TIME_TRACKING))

const {sidebarWidth, isResizing, startResize, isMobile} = useSidebarResize()

const route = useRoute()
const hasLabelFilter = computed(() => Boolean(route.query.labels))

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
	inset-block-start: $chrome-top;
	inset-block-end: 0;
	inset-inline-start: 0;
	inline-size: var(--sidebar-width);
	overflow: hidden;
	z-index: 20;

	@media screen and (max-width: $tablet) {
		inset-block-start: auto;
		inset-block-end: $mobile-tabbar-height;
		inset-inline: 0;
		inline-size: 100%;
		max-block-size: 70dvh;
		padding-block-start: 0.85rem;
		padding-block-end: 0.75rem;
		border-start-start-radius: $radius;
		border-start-end-radius: $radius;
		border-block-start: 1px solid var(--rail-line);
		box-shadow: var(--shadow-md);
		transform: translateY(calc(100% + #{$mobile-tabbar-height}));

		&.is-active {
			transform: translateY(0);
		}

		.top-menu {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		transition: none;
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
	padding-block-start: 1rem;
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
