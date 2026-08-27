<script setup lang="ts">
import {computed} from 'vue'
import {useColorScheme} from '@/composables/useColorScheme'

import LogoMark from '@/assets/logo.svg?component'
import {APP_NAME} from '@/constants/brand'

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
	font-size: 1.25rem;
	font-weight: 650;
	letter-spacing: -0.03em;
	line-height: 1;
	white-space: nowrap;
}

.brand-x {
	color: #e24e1b;
}
</style>
