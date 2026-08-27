import {ref, toValue, watch, type MaybeRefOrGetter} from 'vue'
import ProjectService from '@/services/project'
import type {IProject} from '@/modelTypes/IProject'
import {getBlobFromBlurHash} from '@/helpers/getBlobFromBlurHash'

export function useProjectBackground(
	project: MaybeRefOrGetter<IProject | null>,
	options?: {enabled?: MaybeRefOrGetter<boolean>},
) {
	const background = ref<string | null>(null)
	const backgroundLoading = ref(false)
	const blurHashUrl = ref('')

	watch(
		() => [
			toValue(project)?.id ?? null,
			toValue(project)?.backgroundBlurHash ?? null,
			options?.enabled === undefined ? true : toValue(options.enabled),
		] as [IProject['id'] | null, IProject['backgroundBlurHash'] | null, boolean],
		async ([projectId, blurHash, enabled], oldValue) => {
			const projectValue = toValue(project)
			if (
				!enabled ||
				projectValue === null ||
				!projectValue.backgroundInformation ||
				backgroundLoading.value
			) {
				return
			}

			const [oldProjectId, oldBlurHash, oldEnabled] = oldValue || []
			if (
				oldValue !== undefined &&
				projectId === oldProjectId &&
				blurHash === oldBlurHash &&
				enabled === oldEnabled
			) {
				return
			}

			backgroundLoading.value = true

			try {
				const blurHashPromise = getBlobFromBlurHash(blurHash).then((hashBlob) => {
					blurHashUrl.value = hashBlob ? window.URL.createObjectURL(hashBlob) : ''
				})

				const projectService = new ProjectService()
				const backgroundPromise = projectService.background(projectValue).then((result) => {
					background.value = result
				})
				await Promise.all([blurHashPromise, backgroundPromise])
			} finally {
				backgroundLoading.value = false
			}
		},
		{immediate: true},
	)

	return {
		background,
		blurHashUrl,
		backgroundLoading,
	}
}
