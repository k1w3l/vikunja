<script setup lang="ts">
import {computed} from 'vue'
import {useColorScheme} from '@/composables/useColorScheme'

import LogoMark from '@/assets/logo.svg?component'
import {APP_NAME} from '@/constants/brand'

withDefaults(defineProps<{
	hideName?: boolean
	stacked?: boolean
}>(), {
	hideName: false,
	stacked: false,
})

const {isDark} = useColorScheme()

const CustomLogo = computed(() => {
	const lightLogo = window.CUSTOM_LOGO_URL
	const darkLogo = window.CUSTOM_LOGO_URL_DARK

	if (!lightLogo && !darkLogo) return ''
	if (!darkLogo) return lightLogo
	if (!lightLogo) return darkLogo

	return isDark.value ? darkLogo : lightLogo
})
</script>

<template>
	<div
		class="brand"
		:class="{
			'is-stacked': stacked,
			'is-mark-only': hideName,
		}"
		role="img"
		:aria-label="APP_NAME"
	>
		<img
			v-if="CustomLogo"
			:src="CustomLogo"
			alt=""
			class="logo-mark"
		>
		<LogoMark
			v-else
			class="logo-mark"
			aria-hidden="true"
		/>
		<span
			v-if="!hideName"
			class="brand-name"
			aria-hidden="true"
		>Vikunja<span class="brand-x">X</span></span>
	</div>
</template>

<style lang="scss" scoped>
.brand {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	min-inline-size: 0;
	max-inline-size: 100%;
	color: var(--logo-text-color, var(--text));
}

.logo-mark {
	inline-size: 2rem;
	block-size: 2rem;
	flex: 0 0 2rem;
}

.brand-name {
	display: inline-flex;
	align-items: baseline;
	gap: 0;
	font-family: $vikunja-font;
	font-size: 1.25rem;
	font-weight: 650;
	letter-spacing: -0.03em;
	line-height: 1;
	white-space: nowrap;
}

.brand-x {
	color: #e24e1b;
	font-size: 1em;
	font-weight: 700;
	line-height: inherit;
	letter-spacing: inherit;
}

.is-stacked {
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.85rem;
	text-align: center;

	.logo-mark {
		inline-size: 5.25rem;
		block-size: 5.25rem;
		flex-basis: 5.25rem;
	}

	.brand-name {
		font-size: 1.75rem;
		justify-content: center;
	}
}

.is-mark-only {
	gap: 0;
}
</style>
