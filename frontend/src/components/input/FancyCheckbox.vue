<template>
	<BaseCheckbox
		class="fancy-checkbox"
		:class="{
			'is-disabled': disabled,
			'is-block': isBlock,
			'fancy-checkbox--complete': tone === 'complete',
		}"
		:disabled="disabled"
		:model-value="modelValue"
		:aria-label="ariaLabel"
		@update:modelValue="value => emit('update:modelValue', value)"
	>
		<CheckboxIcon class="fancy-checkbox__icon" />
		<span
			v-if="$slots.default"
			class="fancy-checkbox__content"
		>
			<slot />
		</span>
	</BaseCheckbox>
</template>

<script setup lang="ts">
import CheckboxIcon from '@/assets/checkbox.svg?component'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'

withDefaults(defineProps<{
	modelValue: boolean,
	disabled?: boolean,
	isBlock?: boolean,
	ariaLabel?: string,
	tone?: 'default' | 'complete',
}>(), {
	disabled: false,
	isBlock: false,
	ariaLabel: undefined,
	tone: 'default',
})

const emit = defineEmits<{
	'update:modelValue': [value: boolean]
}>()
</script>

<style lang="scss" scoped>
.fancy-checkbox {
  display: inline-block;
  padding-inline-end: 5px;
  padding-block-start: 3px;

	&.is-block {
		display: block;
		margin: .5rem .2rem;
	}
}

.fancy-checkbox__content {
	font-size: 0.8rem;
	vertical-align: top;
	padding-inline-start: .5rem;
}

.fancy-checkbox__icon:deep() {
	position: relative;
	z-index: 1;
	stroke: var(--stroke-color, var(--grey-300));
	transform-origin: center;
	transform: translate3d(0, 0, 0);
	transition: stroke $transition, transform $transition;

	path,
	polyline {
		transition: stroke-dashoffset 180ms $ease-out-expo, stroke $transition;
	}
}

.fancy-checkbox:hover input:not(:disabled) + .fancy-checkbox__icon,
.fancy-checkbox input:checked + .fancy-checkbox__icon {
	--stroke-color: var(--primary);
}

.fancy-checkbox--complete input:checked + .fancy-checkbox__icon {
	--stroke-color: var(--success);
}

.fancy-checkbox--complete:hover input:not(:disabled, :checked) + .fancy-checkbox__icon {
	--stroke-color: var(--primary);
}

.fancy-checkbox input:focus-visible + .fancy-checkbox__icon {
	border-radius: 4px;
	@include focus-ring;
}

@supports not selector(:focus-visible) {
	.fancy-checkbox input:focus + .fancy-checkbox__icon {
		border-radius: 4px;
		@include focus-ring;
	}
}
</style>

<style lang="scss">
// Since css-has-pseudo doesn't work with deep classes,
// the following rules can't be scoped

.fancy-checkbox :not(input:checked) + .fancy-checkbox__icon {
	path {
		transition-delay: 0.05s;
	}
}

.fancy-checkbox input:checked + .fancy-checkbox__icon {
	path {
		stroke-dashoffset: 60;
	}

	polyline {
		stroke-dashoffset: 42;
		transition-delay: 0.08s;
	}
}

.is-completing .fancy-checkbox--complete input:checked + .fancy-checkbox__icon {
	animation: checkbox-stamp 180ms $ease-out-expo;
}

@keyframes checkbox-stamp {
	from {
		transform: scale(0.92);
	}

	to {
		transform: scale(1);
	}
}

@media (prefers-reduced-motion: reduce) {
	.fancy-checkbox__icon path,
	.fancy-checkbox__icon polyline {
		transition-duration: 0.01ms;
	}

	.is-completing .fancy-checkbox--complete input:checked + .fancy-checkbox__icon {
		animation: none;
	}
}
</style>
