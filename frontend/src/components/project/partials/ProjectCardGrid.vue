<template>
	<ul
		class="project-grid"
		:class="{
			'show-even-number-of-projects': showEvenNumberOfProjects,
			'is-compact': compact,
		}"
	>
		<li
			v-for="(item, index) in filteredProjects"
			:key="`project_${item.id}_${index}`"
			class="project-grid-item"
		>
			<ProjectCard
				:project="item"
				:compact="compact"
			/>
		</li>
	</ul>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import type {IProject} from '@/modelTypes/IProject'

import ProjectCard from './ProjectCard.vue'

const props = withDefaults(defineProps<{
	projects: IProject[],
	showArchived?: boolean,
	itemLimit?: boolean,
	showEvenNumberOfProjects?: boolean,
	compact?: boolean,
}>(), {
	showArchived: false,
	itemLimit: false,
	showEvenNumberOfProjects: false,
	compact: false,
})

const filteredProjects = computed(() => {
	return props.showArchived
		? props.projects
		: props.projects.filter(l => !l.isArchived)
})
</script>

<style lang="scss" scoped>
.project-grid {
	--project-grid-item-height: 150px;
	--project-grid-gap: 1rem;
	margin: 0; // reset li
	list-style-type: none;
	display: grid;
	grid-template-columns: repeat(var(--project-grid-columns), 1fr);
	grid-auto-rows: var(--project-grid-item-height);
	gap: var(--project-grid-gap);

	@media screen and (min-width: $mobile) {
		--project-grid-columns: 1;
	}

	@media screen and (min-width: $mobile) and (max-width: $tablet) {
		--project-grid-columns: 2;
	}

	@media screen and (min-width: $tablet) and (max-width: $widescreen) {
		--project-grid-columns: 3;
	}

	@media screen and (min-width: $widescreen) {
		--project-grid-columns: 5;
	}

	&.show-even-number-of-projects {
		@media screen and (min-width: $widescreen) {
			.project-grid-item:nth-child(5) {
				display: none;
			}
		}
	}

	&.is-compact {
		--project-grid-item-height: 5.5rem;
		--project-grid-gap: 0.5rem;
		--project-grid-columns: 2;

		@media screen and (min-width: $tablet) {
			--project-grid-columns: 3;
		}
	}
}

.project-grid-item {
	display: grid;
	margin-block-start: 0; // remove padding coming form .content li + li
}
</style>
