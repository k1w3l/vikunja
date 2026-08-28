# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: one person organizing their own work and life on an instance they own or trust. Situation: daily capture and review across personal projects, at a desk and on a phone. Job: get tasks out of their head, see what is next, and complete them without depending on a vendor-held SaaS.

This record is for the personal self-hosted instance (public URL `task.kiwel.uk`), not a brief for rebranding or contributing a new official Vikunja identity. Teams, sharing, and instance administration exist in the software; they are not the audience this file optimizes for.

## Product Purpose

Vikunja is a self-hosted task manager. On this instance it exists so personal work and life tasks have a single owned home, separate from calendar (Stalwart) and from other task apps. Success is fast daily capture, a clear next-actions view, and completion — on desktop web (lists and kanban) and on Android via the official app and its “today” widget.

## Positioning

The task manager you actually own. Data lives on hardware the operator controls. Neighboring products can copy lists and boards; they cannot truthfully claim this instance is yours, private, and not a public signup service.

## Operating Context

- One local account; public registration is off.
- Desktop: the Vue web UI in this repo, used as lists and kanban.
- Phone: the official Android app (not this repo). The widget shows today; `+` opens create-task.
- Tasks here are the source of truth for todos. Calendar and mail stay other systems.
- HTTPS is published without SSO HTML intercept, so native clients can authenticate.
- Out of scope for this instance: Tasks.org, DAVx⁵ for tasks, Nextcloud, a custom Android app, Authentik, k3s, and phone CalDAV for tasks.

Ops topology (hosts, guests, backups) lives in the personal wiki (`vikunja-tarefas`), not here.

## Capabilities and Constraints

- Confirmed in daily use: projects, tasks, labels; List and Kanban views.
- Present in this codebase but not confirmed as daily on this instance: Gantt, Table, teams, link sharing, CalDAV, Electron desktop, Pro-gated admin / audit logs / time tracking.
- Frontend in this repo: Vue 3 + TypeScript SPA (`frontend/`), served with the Go API. New user-facing strings go in English source (`frontend/src/i18n/lang/en.json`); other locales are not authored here.
- The license system in `pkg/license/` is part of this codebase. Removing or bypassing it is not in scope unless explicitly requested and confirmed.
- Undecided: whether later UI changes stay private to this instance or are contributed upstream.

## Brand Commitments

- Name: **VikunjaX**. Wordmark is “Vikunja” plus a Cadmium `#e24e1b` **X**.
- Logo: `logo/vikunjax.svg` (copied to `frontend/src/assets/logo.svg` and `frontend/public/vikunjax.svg`). Header/login show the mark plus the wordmark.
- Tagline: “The task manager you actually own.”
- This instance’s chrome uses VikunjaX. It is still a Vikunja fork; do not present it as upstream’s official identity.

## Evidence on Hand

- This instance is in real use. A 2026-08-26 dump had 175 tasks, 10 projects, 1 user, 2 labels.
- Do not fabricate testimonials, other customers, benchmarks, or hosted-cloud claims for this record.
- Public demo `try.vikunja.io` exists; it is not this instance and must not be treated as this user’s data.

## Product Principles

1. Design for one person who already knows their projects — not for team onboarding or marketing conversion.
2. Ownership is the product: private instance, no public signup, data on hardware they control.
3. Optimize the daily loop: capture, see what’s next, complete — desk (list/kanban) and phone (today).
4. Keep the VikunjaX name, cadmium X, and ownership tagline; do not revert to the official blue llama wordmark.
5. Stay a task surface. Calendar, mail, and other homelab apps are not this UI.
