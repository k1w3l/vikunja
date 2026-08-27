import {computed, onBeforeUnmount, ref, toValue, watch, type MaybeRefOrGetter} from 'vue'

// Keep in sync with `.is-laying` in styles/components/tasks.scss
export const TASK_LAY_DURATION_MS = 280
export const TASK_LAY_STAGGER_MS = 24
export const TASK_LAY_CAP = 8
export const TASK_LAY_TOTAL_MS = TASK_LAY_DURATION_MS + (TASK_LAY_CAP - 1) * TASK_LAY_STAGGER_MS + 48

function prefersReducedMotion() {
	return typeof window !== 'undefined'
		&& window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useTaskLay(
	ready: MaybeRefOrGetter<boolean>,
	resetOn?: MaybeRefOrGetter<unknown>,
) {
	const hasLaid = ref(false)
	let timer: ReturnType<typeof setTimeout> | undefined

	const isLaying = computed(() => (
		!hasLaid.value
		&& toValue(ready)
		&& !prefersReducedMotion()
	))

	watch(isLaying, (laying) => {
		clearTimeout(timer)
		if (!laying) {
			return
		}
		timer = setTimeout(() => {
			hasLaid.value = true
		}, TASK_LAY_TOTAL_MS)
	}, {immediate: true})

	if (resetOn !== undefined) {
		watch(() => toValue(resetOn), () => {
			clearTimeout(timer)
			hasLaid.value = false
		})
	}

	onBeforeUnmount(() => {
		clearTimeout(timer)
	})

	return {isLaying}
}
