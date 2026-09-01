<template>
	<menu
		class="menu-list other-menu-items labels-menu"
		:aria-label="$t('label.title')"
	>
		<li
			v-for="label in labelStore.labelsArray"
			:key="label.id"
		>
			<RouterLink
				v-slot="{href, navigate}"
				:to="{name: 'home', query: {labels: String(label.id)}}"
				custom
			>
				<a
					:href="href"
					:class="{'router-link-exact-active': isActive(label.id)}"
					:aria-current="isActive(label.id) ? 'page' : undefined"
					@click="navigate"
				>
					<span class="menu-item-icon icon">
						<span
							class="label-dot"
							:style="dotStyle(label)"
						/>
					</span>
					{{ label.title }}
				</a>
			</RouterLink>
		</li>
		<li
			v-if="!labelStore.isLoading && labelStore.labelsArray.length === 0"
			class="labels-empty"
		>
			<span>{{ $t('navigation.noLabels') }}</span>
		</li>
	</menu>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useRoute} from 'vue-router'

import type {ILabel} from '@/modelTypes/ILabel'
import {useLabelStore} from '@/stores/labels'

const labelStore = useLabelStore()
const route = useRoute()

const activeLabelId = computed(() => {
	if (route.name !== 'home') {
		return null
	}
	const raw = route.query.labels
	if (typeof raw !== 'string') {
		return null
	}
	const id = Number(raw)
	return Number.isFinite(id) ? id : null
})

function isActive(id: ILabel['id']) {
	return activeLabelId.value === id
}

function dotStyle(label: ILabel) {
	if (!label.hexColor) {
		return undefined
	}
	const hex = label.hexColor.startsWith('#') || label.hexColor.startsWith('var(')
		? label.hexColor
		: `#${label.hexColor}`
	return {backgroundColor: hex}
}
</script>

<style lang="scss" scoped>
.menu-item-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.label-dot {
	display: block;
	inline-size: 0.55rem;
	block-size: 0.55rem;
	border-radius: 100%;
	background: var(--rail-muted);
	flex-shrink: 0;
}

.labels-empty {
	min-block-size: 2rem;
	padding: 0.38rem 0.45rem;
	color: var(--rail-muted);
	font-size: 0.82rem;
	font-style: italic;
	pointer-events: none;
}
</style>
