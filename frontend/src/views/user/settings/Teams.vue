<script setup lang="ts">
import {ref, shallowReactive} from 'vue'
import {useI18n} from 'vue-i18n'

import {useTitle} from '@/composables/useTitle'
import TeamService from '@/services/team'
import type {ITeam} from '@/modelTypes/ITeam'

defineOptions({name: 'UserSettingsTeams'})

const {t} = useI18n({useScope: 'global'})
useTitle(() => `${t('team.title')} - ${t('user.settings.title')}`)

const teams = ref<ITeam[]>([])
const teamService = shallowReactive(new TeamService())
teamService.getAll().then((result: ITeam[]) => {
	teams.value = result
})
</script>

<template>
	<Card :title="$t('team.title')">
		<p
			v-if="teams.length === 0 && !teamService.loading"
			class="mbe-4"
		>
			{{ $t('team.noTeams') }}
		</p>

		<div
			v-if="teams.length > 0"
			class="has-horizontal-overflow"
		>
			<table class="table">
				<thead>
					<tr>
						<th>{{ $t('team.attributes.name') }}</th>
						<th class="has-text-end">
							{{ $t('misc.actions') }}
						</th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="team in teams"
						:key="team.id"
					>
						<td>{{ team.name }}</td>
						<td class="has-text-end">
							<XButton
								variant="secondary"
								:to="{name: 'teams.edit', params: {id: team.id}}"
							>
								{{ $t('menu.edit') }}
							</XButton>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<XButton
			:to="{name: 'teams.create'}"
			icon="plus"
			class="mbe-4"
		>
			{{ $t('team.create.title') }}
		</XButton>
	</Card>
</template>
