<template>
	<Modal
		:enabled="open"
		wide
		overflow
		@close="$emit('close')"
	>
		<div class="modal-header">
			<span>{{ $t('label.title') }}</span>
		</div>
		<div class="content labels-modal-body">
			<ListLabels compact />
		</div>
	</Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/misc/Modal.vue'
import ListLabels from '@/views/labels/ListLabels.vue'

defineProps<{
	open: boolean
}>()

defineEmits<{
	close: []
}>()
</script>

<style scoped lang="scss">
.labels-modal-body {
	text-align: start;
	max-block-size: min(70vh, 40rem);
	overflow: auto;
}
</style>
