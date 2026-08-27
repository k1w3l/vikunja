<template>
	<div class="content-auth">
		<BaseButton
			v-show="menuActive"
			:aria-label="$t('navigation.closeSidebar')"
			class="menu-hide-button d-print-none"
			@click="baseStore.setMenuActive(false)"
		>
			<Icon icon="times" />
		</BaseButton>
		<div
			class="app-container"
			:class="{
				'has-background': background || blurHash,
				'inspector-open': inspectorOpen,
			}"
			:style="{
				'background-image': blurHash && `url(${blurHash})`,
				'--sidebar-width': sidebarWidth,
			}"
		>
			<div
				:class="{'is-visible': background}"
				class="app-container-background background-fade-in d-print-none"
				:style="{
					'background-image': background && `url(${background})`,
					'filter': backgroundBrightness && `brightness(${backgroundBrightness}%)`
				}"
			/>
			<Navigation class="d-print-none" />
			<main
				id="main-content"
				tabindex="-1"
				class="app-content"
				:class="[
					{ 'is-menu-enabled': menuActive },
					$route.name,
				]"
			>
				<BaseButton
					v-show="menuActive"
					:aria-label="$t('navigation.closeSidebar')"
					class="mobile-overlay d-print-none"
					@click="baseStore.setMenuActive(false)"
				/>

				<QuickActions />

				<RouterView
					v-slot="{ Component }"
					:route="routeWithModal"
				>
					<keep-alive :include="['project.view']">
						<Transition name="route-fade">
							<component :is="asRouterView(Component)" />
						</Transition>
					</keep-alive>
				</RouterView>

				<BaseButton
					v-shortcut="SHORTCUTS.showKeyboardShortcuts"
					class="keyboard-shortcuts-button d-print-none"
					@click="showKeyboardShortcuts()"
				>
					<span class="is-sr-only">{{ $t('keyboardShortcuts.title') }}</span>
					<Icon icon="keyboard" />
				</BaseButton>
			</main>
			<aside
				v-if="inspectorOpen"
				class="task-inspector d-print-none"
				:class="{'is-open': inspectorOpen}"
				:aria-label="$t('task.detail.title')"
			>
				<component
					:is="currentModal"
					@close="closeModal()"
				/>
			</aside>
			<BaseButton
				v-show="inspectorOpen"
				:aria-label="$t('misc.close')"
				class="inspector-overlay d-print-none"
				@click="closeModal()"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import {watch, computed, onBeforeUnmount, defineAsyncComponent, type Component} from 'vue'
import {useRoute, useRouter} from 'vue-router'

import {SHORTCUTS} from '@/constants/shortcuts'
import Navigation from '@/components/home/Navigation.vue'
import QuickActions from '@/components/quick-actions/QuickActions.vue'
import BaseButton from '@/components/base/BaseButton.vue'

import {useBaseStore} from '@/stores/base'
import {useLabelStore} from '@/stores/labels'
import {useProjectStore} from '@/stores/projects'

import {useRouteWithModal} from '@/composables/useRouteWithModal'
import {useRenewTokenOnFocus} from '@/composables/useRenewTokenOnFocus'
import {useSidebarResize} from '@/composables/useSidebarResize'
import {useWebSocket} from '@/composables/useWebSocket'
import {useAuthStore} from '@/stores/auth'

const asyncViewCache = new WeakMap<object, Component>()

function asRouterView(view: unknown) {
	if (view == null) {
		return view
	}

	const isThenable = typeof view === 'object' && 'then' in view
	const isLazyLoader = typeof view === 'function' && view.length === 0

	if (!isThenable && !isLazyLoader) {
		return view
	}

	const key = view as object
	const cached = asyncViewCache.get(key)
	if (cached) {
		return cached
	}

	const wrapped = isLazyLoader
		? defineAsyncComponent(view as () => Promise<Component>)
		: defineAsyncComponent(() => view as Promise<Component>)
	asyncViewCache.set(key, wrapped)
	return wrapped
}

const authStore = useAuthStore()
const backgroundBrightness = computed(() =>
	authStore.settings?.frontendSettings?.backgroundBrightness,
)

const {sidebarWidth} = useSidebarResize()

const {routeWithModal, currentModal, closeModal} = useRouteWithModal()

const inspectorOpen = computed(() => typeof currentModal.value !== 'undefined')

const baseStore = useBaseStore()
const background = computed(() => baseStore.background)
const blurHash = computed(() => baseStore.blurHash)
const menuActive = computed(() => baseStore.menuActive)

function showKeyboardShortcuts() {
	baseStore.setKeyboardShortcutsActive(true)
}

const route = useRoute()
const router = useRouter()

// FIXME: this is really error prone
// Reset the current project highlight in menu if the current route is not project related.
watch(() => route.name as string, (routeName) => {
	if (
		routeName &&
		(
			[
				'home',
				'teams.index',
				'teams.edit',
				'tasks.range',
				'labels.index',
				'migrate.start',
				'migrate.wunderlist',
				'projects.index',
			].includes(routeName) ||
			routeName.startsWith('user.settings')
		)
	) {
		baseStore.handleSetCurrentProject({project: null})
	}
})

// TODO: Reset the title if the page component does not set one itself

useRenewTokenOnFocus()

const {connect} = useWebSocket()
connect()

const labelStore = useLabelStore()
labelStore.loadAllLabels()

const projectStore = useProjectStore()
projectStore.loadAllProjects()

// Listen for task creation from the quick-entry window
const taskUpdateChannel = new BroadcastChannel('vikunja-task-updates')
taskUpdateChannel.onmessage = (event) => {
	if (event.data?.type === 'task-created-open' && event.data?.taskId) {
		router.push({name: 'task.detail', params: {id: event.data.taskId}})
	}
}

onBeforeUnmount(() => {
	taskUpdateChannel.close()
})
</script>

<style lang="scss" scoped>
.menu-hide-button {
	position: fixed;
	inset-block-start: 0.5rem;
	inset-inline-end: 0.5rem;
	z-index: 31;
	inline-size: 3rem;
	block-size: 3rem;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 1.75rem;
	color: var(--grey-400);
	line-height: 1;
	transition: color $transition;

	@media screen and (min-width: $tablet) {
		display: none;
	}

	&:hover,
	&:focus {
		color: var(--grey-600);
	}
}

.app-container {
	--sidebar-width: #{$navbar-width};
	--inspector-width: #{$inspector-width};

	min-block-size: 100vh;
	padding-block-start: $navbar-height;
	padding-inline-start: var(--sidebar-width);
	padding-inline-end: 0;

	&.inspector-open {
		padding-inline-end: var(--inspector-width);
	}

	@media screen and (max-width: $split-inspector-bp) {
		padding-inline-end: 0;

		&.inspector-open {
			padding-inline-end: 0;
		}
	}

	@media screen and (max-width: $tablet) {
		padding-inline-start: 0;
	}
}

.app-content {
	z-index: 10;
	position: relative;
	min-inline-size: 0;
	padding: 1.25rem 1.35rem 2.5rem;

	.inspector-open & {
		border-inline-end: 1px solid var(--card-border-color);
	}

	@media screen and (max-width: $tablet) {
		margin-inline-start: 0;
		margin-inline-end: 0;
		min-block-size: calc(100vh - #{$navbar-height});
		padding: 1rem 0.9rem 2rem;
		border-inline-end: 0;
	}

	> .loader-container {
		min-block-size: calc(100vh - #{$navbar-height + 1.5rem + 1rem});
	}

	.card {
		background: var(--white);
	}
}

.task-inspector {
	position: fixed;
	inset-block-start: $navbar-height;
	inset-block-end: 0;
	inset-inline-end: 0;
	inline-size: var(--inspector-width);
	overflow-x: visible;
	overflow-y: auto;
	background: var(--inspector-bg);
	padding: 1.25rem 1.2rem 2rem;
	z-index: 15;
	border-inline-start: 1px solid var(--card-border-color);
	box-shadow: -10px 0 24px hsla(20, 14%, 10%, 0.06);

	:deep(.columns) {
		display: flex;
		flex-direction: column;
		margin: 0;
	}

	:deep(.column) {
		inline-size: 100% !important;
		padding-inline: 0;
	}

	:deep(.field.has-addons) {
		flex-wrap: wrap;
		row-gap: 0.5rem;
	}

	:deep(.select),
	:deep(.select select) {
		max-inline-size: 100%;
	}

	@media screen and (max-width: $split-inspector-bp) {
		inline-size: min(#{$inspector-width}, 100vw);
		transform: translateX(100%);
		transition: transform $transition-layout $ease-out-expo;
		z-index: 25;
		box-shadow: none;

		[dir="rtl"] & {
			transform: translateX(-100%);
		}

		&.is-open {
			transform: translateX(0);
			box-shadow: -10px 0 24px hsla(20, 14%, 10%, 0.12);
		}
	}
}

.inspector-overlay {
	display: none;
}

@media screen and (max-width: $split-inspector-bp) {
	.inspector-overlay {
		display: block;
		position: fixed;
		inset: $navbar-height 0 0 0;
		background: hsla(20, 14%, 10%, 0.35);
		z-index: 24;
	}
}

.mobile-overlay {
	display: none;
	position: fixed;
	inset-block-start: 0;
	inset-block-end: 0;
	inset-inline-start: 0;
	inset-inline-end: 0;
	block-size: 100vh;
	inline-size: 100vw;
	background: hsla(var(--grey-100-hsl), 0.8);
	z-index: 5;
	opacity: 0;
	transition: opacity $transition;

	@media screen and (max-width: $tablet) {
		display: block;
		opacity: 1;
	}
}

.keyboard-shortcuts-button {
	position: absolute;
	inset-block-end: 1rem;
	inset-inline-end: 1rem;
	z-index: 20;
	color: var(--grey-500);
	transition: color $transition;

	@media screen and (max-width: $tablet) {
		display: none;
	}
}

.content-auth {
	position: relative;
	z-index: 1;
}
</style>
