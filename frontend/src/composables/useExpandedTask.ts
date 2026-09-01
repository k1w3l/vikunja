import {ref} from 'vue'

const expandedTaskId = ref<number | null>(null)

export function useExpandedTask() {
	function expand(id: number) {
		expandedTaskId.value = id
	}

	function collapse() {
		expandedTaskId.value = null
	}

	function toggle(id: number) {
		expandedTaskId.value = expandedTaskId.value === id ? null : id
	}

	function isExpanded(id: number) {
		return expandedTaskId.value === id
	}

	return {
		expandedTaskId,
		expand,
		collapse,
		toggle,
		isExpanded,
	}
}
