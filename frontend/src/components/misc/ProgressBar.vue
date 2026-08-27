<template>
	<div
		class="progress-bar"
		:class="{
			'is-small': isSmall,
			'is-primary': isPrimary,
		}"
		role="progressbar"
		:aria-valuemin="0"
		:aria-valuemax="100"
		:aria-valuenow="clamped"
		:aria-valuetext="`${clamped}%`"
		:aria-label="progressLabel"
	>
		<span
			class="progress-bar__fill"
			:style="{ transform: `scaleX(${clamped / 100})` }"
		/>
	</div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'

const props = withDefaults(defineProps<{
	value: number
	isSmall?: boolean
	isPrimary?: boolean
	ariaLabel?: string
}>(), {
	isSmall: false,
	isPrimary: false,
	ariaLabel: undefined,
})

const {t} = useI18n({useScope: 'global'})
const clamped = computed(() => Math.round(Math.min(100, Math.max(0, props.value))))
const progressLabel = computed(() => props.ariaLabel ?? t('task.attributes.percentDone'))
</script>

<style lang="scss" scoped>
.progress-bar {
	contain: layout paint;
	display: block;
	inline-size: 100%;
	min-inline-size: 0;
	block-size: 4px;
	margin: 0;
	overflow: hidden;
	border-radius: $radius;
	background: var(--grey-200);
}

.progress-bar__fill {
	display: block;
	block-size: 100%;
	inline-size: 100%;
	transform-origin: 0 50%;
	background: var(--success);
	transition: transform $transition-layout;
}

.progress-bar:dir(rtl) .progress-bar__fill {
	transform-origin: 100% 50%;
}

.progress-bar.is-small {
	block-size: 3px;
}

.progress-bar.is-primary .progress-bar__fill {
	background: var(--primary);
}

@media (prefers-reduced-motion: reduce) {
	.progress-bar__fill {
		transition: none;
	}
}
</style>
