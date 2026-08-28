<template>
	<Dropdown class="select-dropdown">
		<template #trigger="{toggleOpen, open}">
			<BaseButton
				class="select-dropdown-trigger"
				:disabled="disabled"
				:aria-expanded="open"
				:aria-label="$t('task.attributes.priority')"
				@click="disabled ? undefined : toggleOpen()"
			>
				<span>{{ currentLabel }}</span>
				<Icon
					icon="chevron-down"
					class="select-dropdown-chevron"
					:class="{'is-open': open}"
				/>
			</BaseButton>
		</template>
		<template #default="{close}">
			<DropdownItem
				v-for="option in options"
				:key="option.value"
				:class="{'is-active': priority === option.value}"
				@click="select(option.value, close)"
			>
				{{ option.label }}
			</DropdownItem>
		</template>
	</Dropdown>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'

import {PRIORITIES} from '@/constants/priorities'
import BaseButton from '@/components/base/BaseButton.vue'
import Dropdown from '@/components/misc/Dropdown.vue'
import DropdownItem from '@/components/misc/DropdownItem.vue'

withDefaults(defineProps<{
	disabled?: boolean
}>(), {
	disabled: false,
})

const priority = defineModel<number>({
	required: true,
	default: 0,
})

const {t} = useI18n({useScope: 'global'})

const options = computed(() => [
	{value: PRIORITIES.UNSET, label: t('task.priority.unset')},
	{value: PRIORITIES.LOW, label: t('task.priority.low')},
	{value: PRIORITIES.MEDIUM, label: t('task.priority.medium')},
	{value: PRIORITIES.HIGH, label: t('task.priority.high')},
	{value: PRIORITIES.URGENT, label: t('task.priority.urgent')},
	{value: PRIORITIES.DO_NOW, label: t('task.priority.doNow')},
])

const currentLabel = computed(() => {
	return options.value.find(option => option.value === priority.value)?.label ?? t('task.priority.unset')
})

function select(value: number, close: () => void) {
	priority.value = value
	close()
}
</script>
