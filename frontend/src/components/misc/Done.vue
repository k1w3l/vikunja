<template>
	<Transition name="done-stamp">
		<div
			v-if="isDone"
			class="is-done"
			:class="{ 'is-done--small': variant === 'small' }"
		>
			{{ $t('task.attributes.done') }}
		</div>
	</Transition>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
	isDone?: boolean
	variant?: 'default' | 'small'
}>(), {
	isDone: false,
	variant: 'default',
})
</script>


<style lang="scss" scoped>
.is-done {
	background: var(--success);
	color: var(--button-text);
	padding: .5rem;
	font-weight: 620;
	font-size: 0.82rem;
	line-height: 1;
	border-radius: $radius;
	text-align: center;
	transform-origin: center;
}

.is-done--small {
	padding: .2rem .3rem;
}

.done-stamp-enter-active {
	transition: transform 180ms $ease-out-expo, opacity 180ms $ease-out-expo;
}

.done-stamp-enter-from {
	opacity: 0;
	transform: scale(0.92);
}

.done-stamp-leave-active {
	transition: opacity 120ms $ease-out-expo;
}

.done-stamp-leave-to {
	opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
	.done-stamp-enter-from {
		transform: none;
	}
}
</style>
