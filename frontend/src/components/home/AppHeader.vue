<template>
	<header
		:class="{ 'has-background': background, 'menu-active': menuActive }"
		aria-label="main navigation"
		class="navbar d-print-none"
	>
		<RouterLink
			:to="{ name: 'home' }"
			class="logo-link"
			:aria-label="$t('navigation.home')"
		>
			<Logo
				width="164"
				height="48"
			/>
		</RouterLink>

		<MenuButton class="menu-button" />

		<div
			v-if="!currentProject?.id && pageTitle"
			class="project-title-wrapper"
		>
			<span class="project-title">{{ pageTitle }}</span>
		</div>

		<div class="navbar-end">
			<TimerBadge />
			<OpenQuickActions />
			<Notifications />
			<Dropdown>
				<template #trigger="{ toggleOpen, open }">
					<BaseButton
						class="username-dropdown-trigger"
						variant="secondary"
						:shadow="false"
						:aria-expanded="open"
						@click="toggleOpen"
					>
						<img
							:src="authStore.avatarUrl"
							alt=""
							class="avatar"
							width="40"
							height="40"
						>
						<span class="username">{{ authStore.userDisplayName }}</span>
						<span
							class="mis-1 dropdown-icon icon is-small"
							:style="{
								transform: open ? 'rotate(180deg)' : 'rotate(0)',
							}"
						>
							<Icon icon="chevron-down" />
						</span>
					</BaseButton>
				</template>

				<DropdownItem :to="{ name: 'projects.index' }">
					{{ $t('project.projects') }}
				</DropdownItem>
				<DropdownItem :to="{ name: 'labels.index' }">
					{{ $t('label.title') }}
				</DropdownItem>
				<DropdownItem :to="{ name: 'teams.index' }">
					{{ $t('team.title') }}
				</DropdownItem>
				<DropdownItem :to="{ name: 'user.settings' }">
					{{ $t('user.settings.title') }}
				</DropdownItem>
				<DropdownItem
					v-if="adminPanelEnabled && authStore.info?.isAdmin"
					:to="{ name: 'admin.overview' }"
				>
					{{ $t('admin.title') }}
				</DropdownItem>
				<DropdownItem
					v-if="imprintUrl"
					:href="imprintUrl"
				>
					{{ $t('navigation.imprint') }}
				</DropdownItem>
				<DropdownItem
					v-if="privacyPolicyUrl"
					:href="privacyPolicyUrl"
				>
					{{ $t('navigation.privacy') }}
				</DropdownItem>
				<DropdownItem @click="baseStore.setKeyboardShortcutsActive(true)">
					{{ $t('keyboardShortcuts.title') }}
				</DropdownItem>
				<DropdownItem :to="{ name: 'about' }">
					{{ $t('about.title') }}
				</DropdownItem>
				<DropdownItem @click="authStore.logout()">
					{{ $t('user.auth.logout') }}
				</DropdownItem>
			</Dropdown>
		</div>
	</header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { PRO_FEATURE } from '@/constants/proFeatures'

import Dropdown from '@/components/misc/Dropdown.vue'
import DropdownItem from '@/components/misc/DropdownItem.vue'
import Notifications from '@/components/notifications/Notifications.vue'
import TimerBadge from '@/components/time-tracking/TimerBadge.vue'
import Logo from '@/components/home/Logo.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import MenuButton from '@/components/home/MenuButton.vue'
import OpenQuickActions from '@/components/misc/OpenQuickActions.vue'

import { useBaseStore } from '@/stores/base'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/auth'
import type { IProject } from '@/modelTypes/IProject'

const baseStore = useBaseStore()
const currentProject = computed<IProject | null>(() => {
	const project = baseStore.currentProject
	return project ? { ...project } as IProject : null
})
const background = computed(() => baseStore.background)
const menuActive = computed(() => baseStore.menuActive)

const route = useRoute()
const { t } = useI18n()
const pageTitle = computed(() => {
	if (route.name === 'home') {
		return ''
	}
	const title = route.meta.title as string | undefined
	return title ? t(title) : ''
})

const authStore = useAuthStore()

const configStore = useConfigStore()
const imprintUrl = computed(() => configStore.legal.imprintUrl)
const privacyPolicyUrl = computed(() => configStore.legal.privacyPolicyUrl)
const adminPanelEnabled = computed(() => configStore.isProFeatureEnabled(PRO_FEATURE.ADMIN_PANEL))
</script>

<style lang="scss" scoped>
$user-dropdown-width-mobile: 5rem;

.navbar {
	--navbar-button-min-width: 40px;
	--navbar-gap-width: 1rem;
	--navbar-icon-size: 1.25rem;

	position: fixed;
	inset-block-start: 0;
	inset-inline-start: 0;
	inset-inline-end: 0;
	z-index: 30;

	display: flex;
	justify-content: space-between;
	gap: var(--navbar-gap-width);
	min-block-size: $navbar-height;

	background: var(--surface-elevated);
	border-block-end: 1px solid var(--card-border-color);

	@media screen and (min-width: $tablet) {
		padding-inline-start: 2rem;
		align-items: stretch;
	}

	&.menu-active {
		@media screen and (max-width: $tablet) {
			z-index: 0;
		}
	}

	// FIXME: notifications should provide a slot for the icon instead, so that we can style it as we want
	:deep() {
		.trigger-button {
			color: var(--grey-400);
			font-size: var(--navbar-icon-size);
		}
	}
}

.logo-link {
	display: flex;
	align-items: center;
	padding-inline-start: 0.5rem;
	flex: 0 0 auto;
	min-inline-size: 0;

	@media screen and (max-width: $tablet) {
		display: none;
	}

	:deep(.logo) {
		max-block-size: 2rem;
		inline-size: auto;
	}
}

.menu-button {
	margin-inline-end: auto;
	align-self: stretch;
	flex: 0 0 auto;

	@media screen and (min-width: $tablet) {
		display: none;
	}

	@media screen and (max-width: $tablet) {
		margin-inline-start: 1rem;
	}
}

.project-title-wrapper {
	display: flex;
	align-items: center;
	min-inline-size: 0;
	flex: 1 1 auto;

	@media screen and (min-width: $tablet) {
		padding-inline: var(--navbar-gap-width);
	}

	&:hover .project-edit-button,
	&:focus-within .project-edit-button {
		opacity: 1;
	}
}

.project-title {
	font-size: 1rem;
	// We need the following for overflowing ellipsis to work
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;

	@media screen and (min-width: $tablet) {
		font-size: 1.5rem;
	}
}

.project-title-button {
	align-self: stretch;
	min-inline-size: var(--navbar-button-min-width);
	display: flex;
	place-items: center;
	justify-content: center;
	font-size: var(--navbar-icon-size);
	color: var(--grey-400);
}

.project-edit-button {
	opacity: 0;
	transition: opacity $transition, color $transition;

	&:hover,
	&:focus-visible {
		color: var(--grey-800);
		opacity: 1;
	}

	@media (hover: none) {
		opacity: 1;
	}
}

.navbar-end {
	flex: 0 0 auto;
	display: flex;
	align-items: stretch;
	margin-inline-start: auto;

	>* {
		min-inline-size: var(--navbar-button-min-width);
	}
}

.username-dropdown-trigger {
	padding-inline-start: .75rem;
	display: inline-flex;
	align-items: center;
	font-size: .85rem;
	font-weight: 700;
	gap: .5rem;
	
	:deep(.avatar) {
		margin-inline-end: 0;
	}
	
	[dir="rtl"] & {
		flex-direction: row-reverse;
	}

	@media screen and (max-width: $tablet) {
		padding-inline-end: .5rem;
	}

	@media screen and (min-width: $tablet) {
		padding-inline-end: .75rem;
	}
}

.username {
	font-family: $vikunja-font;

	@media screen and (max-width: $tablet) {
		display: none;
	}
}

.dropdown-icon {
	transition: transform $transition;
}

.avatar {
	border-radius: 100%;
	vertical-align: middle;
	block-size: 40px;
	margin-inline-end: .5rem;
}
</style>
