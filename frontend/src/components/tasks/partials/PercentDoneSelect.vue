<template>
	<Dropdown class="select-dropdown">
		<template #trigger="{toggleOpen, open}">
			<BaseButton
				class="select-dropdown-trigger"
				:disabled="disabled"
				:aria-expanded="open"
				:aria-label="$t('task.attributes.percentDone')"
				@click="disabled ? undefined : toggleOpen()"
			>
				<span>{{ Math.round(percentDone * 100) }}%</span>
				<Icon
					icon="chevron-down"
					class="select-dropdown-chevron"
					:class="{'is-open': open}"
				/>
			</BaseButton>
		</template>
		<template #default="{close}">
			<DropdownItem
				v-for="option in PERCENT_OPTIONS"
				:key="option"
				:class="{'is-active': percentDone === option}"
				@click="select(option, close)"
			>
				{{ option * 100 }}%
			</DropdownItem>
		</template>
	</Dropdown>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import Dropdown from '@/components/misc/Dropdown.vue'
import DropdownItem from '@/components/misc/DropdownItem.vue'

withDefaults(defineProps<{
	disabled?: boolean
}>(), {
	disabled: false,
})

const percentDone = defineModel<number>({ required: true })

const PERCENT_OPTIONS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] as const

function select(value: number, close: () => void) {
	percentDone.value = value
	close()
}
</script>
