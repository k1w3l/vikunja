import {useMediaQuery} from '@vueuse/core'

export const PHONE_BREAKPOINT_PX = 768

export function useIsPhone() {
	return useMediaQuery(`(max-width: ${PHONE_BREAKPOINT_PX}px)`)
}
