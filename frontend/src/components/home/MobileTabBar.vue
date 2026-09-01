<template>
	<nav
		class="mobile-tab-bar d-print-none"
		:aria-label="$t('navigation.main')"
	>
		<RouterLink
			v-slot="{href, navigate, isExactActive}"
			:to="{name: 'home'}"
			custom
		>
			<a
				:href="href"
				class="tab-item"
				:class="{'is-active': isExactActive && !menuActive}"
				:aria-current="isExactActive && !menuActive ? 'page' : undefined"
				@click="go($event, navigate)"
			>
				<Icon icon="house" />
				<span>{{ $t('navigation.overview') }}</span>
			</a>
		</RouterLink>

		<BaseButton
			class="tab-item"
			:class="{'is-active': isProjects}"
			:aria-current="isProjects && !menuActive ? 'page' : undefined"
			:aria-expanded="menuActive"
			aria-controls="nav-projects-sheet"
			data-cy="mobile-tab-projects"
			@click="toggleProjects"
		>
			<Icon icon="folder" />
			<span>{{ $t('project.projects') }}</span>
		</BaseButton>

		<RouterLink
			v-slot="{href, navigate, isExactActive}"
			:to="{name: 'tasks.range'}"
			custom
		>
			<a
				:href="href"
				class="tab-item"
				:class="{'is-active': isExactActive && !menuActive}"
				:aria-current="isExactActive && !menuActive ? 'page' : undefined"
				@click="go($event, navigate)"
			>
				<Icon :icon="['far', 'calendar-alt']" />
				<span>{{ $t('navigation.upcoming') }}</span>
			</a>
		</RouterLink>
	</nav>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useRoute} from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import {useBaseStore} from '@/stores/base'

const baseStore = useBaseStore()
const route = useRoute()
const menuActive = computed(() => baseStore.menuActive)

const isProjects = computed(() => {
	if (menuActive.value) {
		return true
	}
	const name = String(route.name ?? '')
	return name.startsWith('project.') || Boolean(baseStore.currentProject?.id)
})

function go(e: MouseEvent, navigate: (e: MouseEvent) => void) {
	baseStore.setMenuActive(false)
	navigate(e)
}

function toggleProjects() {
	baseStore.setMenuActive(!menuActive.value)
}
</script>

<style lang="scss" scoped>
.mobile-tab-bar {
	display: none;

	@media screen and (max-width: $tablet) {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		align-items: stretch;
		position: fixed;
		inset-inline: 0;
		inset-block-end: 0;
		z-index: 22;
		min-block-size: $mobile-tabbar-height;
		padding-block-start: 0.35rem;
		padding-block-end: env(safe-area-inset-bottom, 0);
		padding-inline: env(safe-area-inset-left, 0) env(safe-area-inset-right, 0);
		background: color-mix(in srgb, var(--rail-bg) 78%, transparent);
		backdrop-filter: blur(22px) saturate(1.35);
		border-block-start: 1px solid color-mix(in srgb, var(--rail-line) 70%, transparent);
	}
}

.tab-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.2rem;
	inline-size: 100%;
	min-block-size: 44px;
	padding-block: 0.2rem 0.25rem;
	color: var(--rail-muted);
	font-family: $vikunja-font;
	font-size: 0.82rem;
	font-weight: 620;
	line-height: 1.2;
	letter-spacing: 0;
	text-decoration: none;
	border-radius: $radius;
	transition: color $transition;

	:deep(svg) {
		inline-size: 1.25rem;
		block-size: 1.25rem;
	}

	&.is-active {
		color: var(--primary);
	}

	&:focus-visible {
		box-shadow: 0 0 0 2px hsla(var(--primary-hsl), 0.5);
	}
}

@supports not (background: color-mix(in srgb, black 50%, transparent)) {
	.mobile-tab-bar {
		@media screen and (max-width: $tablet) {
			background: hsla(20, 18%, 8%, 0.88);
		}
	}
}
</style>
