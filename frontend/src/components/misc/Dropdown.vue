<template>
	<div
		ref="dropdown"
		class="dropdown"
		@pointerenter="initialMount = true"
		@keydown="onKeydown"
	>
		<slot
			name="trigger"
			:close="close"
			:toggle-open="toggleOpen"
			:open="open"
		>
			<BaseButton
				class="dropdown-trigger is-flex"
				:aria-label="triggerLabel"
				:aria-expanded="open"
				@click="toggleOpen"
			>
				<Icon
					:icon="triggerIcon"
					class="icon"
				/>
			</BaseButton>
		</slot>

		<CustomTransition name="fade">
			<div
				v-if="initialMount || open"
				v-show="open"
				ref="dropdownMenu"
				class="dropdown-menu"
				:class="{ 'is-match-trigger': matchTrigger }"
				:style="dropdownMenuStyle"
			>
				<div class="dropdown-content">
					<slot :close="close" />
				</div>
			</div>
		</CustomTransition>
	</div>
</template>

<script setup lang="ts">
import {ref, nextTick, watch, computed} from 'vue'
import {onClickOutside} from '@vueuse/core'
import {computePosition, autoPlacement, flip, offset, shift, size} from '@floating-ui/dom'
import type {IconProp} from '@fortawesome/fontawesome-svg-core'

import CustomTransition from '@/components/misc/CustomTransition.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = withDefaults(defineProps<{
	triggerIcon?: IconProp
	triggerLabel?: string
	matchTrigger?: boolean
}>(), {
	triggerIcon: 'ellipsis-h',
	triggerLabel: undefined,
	matchTrigger: false,
})

const emit = defineEmits<{
	'close': [event: PointerEvent]
}>()

defineSlots<{
	'trigger': (props: {
		close: () => void,
		toggleOpen: () => void, 
		open: boolean
	}) => void,
	'default': () => void
}>()

const initialMount = ref(false)
const open = ref(false)

const dropdown = ref<HTMLElement>()
const dropdownMenu = ref<HTMLElement>()
const dropdownPosition = ref({x: 0, y: 0})
const dropdownMenuOffset = computed(() => 4)

function close() {
	open.value = false
}

async function updatePosition() {
	if (!dropdown.value || !dropdownMenu.value) {
		return
	}

	await nextTick()

	const {x, y} = await computePosition(dropdown.value, dropdownMenu.value, {
		placement: props.matchTrigger ? 'bottom-start' : 'bottom-end',
		strategy: 'absolute',
		middleware: props.matchTrigger
			? [
				offset(dropdownMenuOffset.value),
				flip({fallbackPlacements: ['top-start']}),
				shift({padding: 8}),
				size({
					apply({rects, elements}) {
						elements.floating.style.width = `${rects.reference.width}px`
					},
				}),
			]
			: [
				offset(dropdownMenuOffset.value),
				autoPlacement({
					allowedPlacements: ['bottom-end', 'top-end', 'bottom-start', 'top-start'],
					padding: 8,
				}),
				shift({padding: 8}),
			],
	})

	dropdownPosition.value = {x, y}
}

const dropdownMenuStyle = computed(() => ({
	left: `${dropdownPosition.value.x}px`,
	top: `${dropdownPosition.value.y}px`,
	'--hover-offset': `${dropdownMenuOffset.value}px`,
}))

function toggleOpen() {
	open.value = !open.value
}

function onKeydown(e: KeyboardEvent) {
	if (e.key !== 'Escape' || !open.value) {
		return
	}
	e.stopPropagation()
	close()
	focusTrigger()
}

// Return focus to the trigger, which is the first focusable element that lives
// outside the popup menu.
function focusTrigger() {
	const focusables = dropdown.value?.querySelectorAll<HTMLElement>('button, a[href], input, [tabindex]')
	for (const el of focusables ?? []) {
		if (!el.closest('.dropdown-menu')) {
			el.focus()
			return
		}
	}
}

watch(open, (isOpen) => {
	if (isOpen) {
		updatePosition()
	}
})

onClickOutside(dropdown, (e) => {
	if (!open.value) {
		return
	}
	close()
	emit('close', e)
})
</script>

<style lang="scss" scoped>
.dropdown {
	display: inline-flex;
	position: relative;
}

.dropdown-menu::before {
	content: "";
	position: absolute;
	inset: calc(var(--hover-offset) * -1);
	pointer-events: none;
}

.dropdown-menu {
	min-inline-size: 12rem;
	position: absolute;
	z-index: 20;
	display: block;

	&.is-match-trigger {
		min-inline-size: 0;
		box-sizing: border-box;

		:deep(.dropdown-item) {
			white-space: normal;
		}
	}
}

.dropdown-content {
	position: relative;
	z-index: 1;
	background-color: var(--white);
	border-radius: $radius;
	padding-block-end: .5rem;
	padding-block-start: .5rem;
	box-shadow: var(--shadow-md);
}

.dropdown-divider {
	background-color: var(--border-light);
	border: none;
	display: block;
	block-size: 1px;
	margin: 0.5rem 0;
}
</style>
