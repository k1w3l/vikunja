<template>
	<div class="menu-section-header">
		<h2
			:id="headingId"
			class="menu-section-title"
		>
			{{ title }}
		</h2>
		<RouterLink
			v-if="createTo"
			:to="createTo"
			class="menu-section-add"
			:class="createClass"
			active-class=""
			exact-active-class=""
			:aria-label="createLabel"
		>
			<Icon icon="plus" />
		</RouterLink>
	</div>
</template>

<script setup lang="ts">
import type {RouteLocationRaw} from 'vue-router'

defineProps<{
	title: string
	headingId?: string
	createTo?: RouteLocationRaw
	createLabel?: string
	createClass?: string
}>()
</script>

<style lang="scss" scoped>
.menu-section-header {
	display: flex;
	align-items: center;
	gap: 0.35rem;
	min-block-size: 1.75rem;
	padding-inline: 0.45rem 0.15rem;
	margin-block-end: 0.15rem;
}

.menu-section-title {
	margin: 0;
	flex: 1 1 auto;
	min-inline-size: 0;
	font-family: $vikunja-font;
	font-size: 0.82rem;
	font-weight: 620;
	line-height: 1.2;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: var(--rail-muted);
}

.menu-section-add {
	flex: 0 0 1.5rem;
	inline-size: 1.5rem;
	block-size: 1.5rem;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: $radius;
	color: var(--rail-muted);
	transition: color $transition, background-color $transition;

	:deep(svg) {
		inline-size: 0.7rem;
		block-size: 0.7rem;
	}

	&:hover,
	&:focus-visible {
		color: var(--rail-ink);
		background: var(--rail-active);
	}
}
</style>
