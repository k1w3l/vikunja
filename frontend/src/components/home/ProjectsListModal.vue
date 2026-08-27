<template>
	<Modal
		:enabled="open"
		wide
		overflow
		@close="$emit('close')"
	>
		<div class="modal-header">
			<span>{{ $t('project.projects') }}</span>
		</div>
		<div class="content projects-modal-body">
			<ListProjects compact />
		</div>
	</Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/misc/Modal.vue'
import ListProjects from '@/views/project/ListProjects.vue'

defineProps<{
	open: boolean
}>()

defineEmits<{
	close: []
}>()
</script>

<style scoped lang="scss">
.projects-modal-body {
	text-align: start;
	max-block-size: min(70vh, 40rem);
	overflow: auto;
}
</style>
