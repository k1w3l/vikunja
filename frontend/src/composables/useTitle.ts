import {computed, toValue} from 'vue'

import {useTitle as useTitleVueUse, type UseTitleOptions, type ReadonlyRefOrGetter, type MaybeRef, type MaybeRefOrGetter} from '@vueuse/core'
import {APP_NAME} from '@/constants/brand'

export function useTitle(
	newTitle:
		| ReadonlyRefOrGetter<string | null | undefined>
		| MaybeRef<string | null | undefined>
		| MaybeRefOrGetter<string | null | undefined> = null,
	options?: UseTitleOptions,
) {
	const pageTitle = computed(() => toValue(newTitle))

	const completeTitle = computed(() =>
		(typeof pageTitle.value === 'undefined' || pageTitle.value === '')
			? APP_NAME
			: `${pageTitle.value} | ${APP_NAME}`,
	)

	return useTitleVueUse(completeTitle, options)
}
