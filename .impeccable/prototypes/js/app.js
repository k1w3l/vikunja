;(function () {
	const I = window.Icons
	const S = window.Store
	const D = window.PROTO_DATA
	const proto = window.PROTO || { version: 'a-rail', page: 'overview' }

	function qs(name, fallback) {
		const v = new URLSearchParams(location.search).get(name)
		return v || fallback
	}

	function href(page, params) {
		const file = page + '.html'
		const q = new URLSearchParams(params || {})
		const s = q.toString()
		return s ? file + '?' + s : file
	}

	function taskHref(task) {
		if (proto.version === 'c-split' && proto.page !== 'detail') {
			const params = { task: task.id }
			if (proto.page === 'list' || proto.page === 'kanban') params.project = qs('project', task.projectId)
			return href(proto.page, params)
		}
		return href('detail', { task: task.id, project: task.projectId })
	}

	function formatDue(iso) {
		if (!iso) return ''
		const [y, m, d] = iso.split('-')
		return `${d}/${m}`
	}

	function projectDot(p) {
		return `<span class="pdot color-${p.color}" aria-hidden="true"></span>`
	}

	function taskCheck(task) {
		const cls = task.done ? 'check is-done' : 'check'
		return `<button type="button" class="${cls}" data-noop aria-label="${task.done ? 'Concluída' : 'Marcar concluída'}">${task.done ? I.svg('check', 14) : ''}</button>`
	}

	function parentCrumb(task) {
		const parent = S.parent(task)
		if (!parent) return ''
		return `<span class="crumb">de ${esc(parent.title)}</span>`
	}

	function esc(s) {
		return String(s).replace(/[&<>"']/g, c => ({
			'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
		}[c]))
	}

	function taskRow(task, opts) {
		opts = opts || {}
		const p = S.project(task.projectId)
		const nested = opts.nested
		const kids = nested ? [] : S.children(task.id)
		const showKids = proto.page === 'list' && kids.length
		let nestedHtml = ''
		if (showKids) {
			nestedHtml = `<ul class="nested">${kids.map(c => taskRow(c, { nested: true })).join('')}</ul>`
		}
		const meta = [
			p ? `<a class="meta-proj" href="${href('list', { project: p.id })}">${esc(p.title)}</a>` : '',
			task.due ? `<time datetime="${task.due}">${formatDue(task.due)}</time>` : '',
			S.isSubtask(task) && S.showsLoose(task) && !nested ? parentCrumb(task) : '',
		].filter(Boolean).join('<span class="dot">·</span>')

		return `<li class="task ${nested ? 'is-nested' : ''} ${task.done ? 'is-done' : ''}" data-task="${task.id}">
			${taskCheck(task)}
			<a class="task-body" href="${taskHref(task)}">
				<span class="task-title">${esc(task.title)}</span>
				${meta ? `<span class="task-meta">${meta}</span>` : ''}
			</a>
			${nestedHtml}
		</li>`
	}

	function captureBar() {
		return `<form class="capture" action="#" onsubmit="return false">
			${I.svg('plus', 18)}
			<input type="text" name="title" placeholder="Adicionar tarefa…" autocomplete="off">
			<button type="submit" class="btn btn-primary">Adicionar</button>
		</form>`
	}

	function globalNav(active) {
		const items = [
			{ page: 'overview', label: 'Visão geral', icon: 'overview' },
			{ page: 'upcoming', label: 'Próximas', icon: 'upcoming' },
			{ page: 'projects', label: 'Projetos', icon: 'projects', href: href('list', { project: qs('project', 'casa') }) },
			{ page: 'labels', label: 'Etiquetas', icon: 'labels', href: '#' },
			{ page: 'teams', label: 'Equipas', icon: 'teams', href: '#' },
		]
		return `<nav class="global" aria-label="Principal">
			${items.map(it => {
				const url = it.href || href(it.page)
				const on = active === it.page ? 'is-active' : ''
				return `<a class="nav-item ${on}" href="${url}" title="${esc(it.label)}">
					${I.svg(it.icon, 20)}
					<span class="nav-label">${esc(it.label)}</span>
				</a>`
			}).join('')}
		</nav>`
	}

	function projectNav(currentId) {
		return `<nav class="projects" aria-label="Projetos">
			${D.projects.map(p => {
				const on = currentId === p.id ? 'is-active' : ''
				return `<a class="nav-item ${on}" href="${href('list', { project: p.id })}" title="${esc(p.title)}">
					<span class="picon color-${p.color}">${I.svg(p.icon, 16)}</span>
					<span class="nav-label">${esc(p.title)}</span>
				</a>`
			}).join('')}
		</nav>`
	}

	function viewSwitch(projectId, current) {
		if (!projectId) return ''
		return `<div class="view-switch" role="tablist">
			<a class="${current === 'list' ? 'is-active' : ''}" href="${href('list', { project: projectId })}">${I.svg('list', 16)} Lista</a>
			<a class="${current === 'kanban' ? 'is-active' : ''}" href="${href('kanban', { project: projectId })}">${I.svg('kanban', 16)} Kanban</a>
		</div>`
	}

	function banner() {
		return `<p class="synthetic">Conteúdo sintético · Vikunja · escolha um caminho no <a href="../index.html">índice</a></p>`
	}

	function brand() {
		return `<a class="brand" href="${href('overview')}" aria-label="Vikunja, início">
			<img src="../assets/logo.svg" width="32" height="32" alt="">
			<span class="brand-word">Vikunja</span>
		</a>`
	}

	function listMain(projectId) {
		const p = S.project(projectId)
		const roots = S.inProject(projectId).filter(t => !t.parentId)
		const promoted = S.inProject(projectId).filter(t => t.parentId && S.showsLoose(t))
		const shown = roots.map(t => taskRow(t)).join('')
		const extra = promoted.length
			? `<p class="hint-promoted">${promoted.length} subtarefa(s) com “mostrar na lista”</p>` +
				`<ul class="task-list">${promoted.map(t => taskRow(t)).join('')}</ul>`
			: ''
		return `${banner()}
			<header class="page-head">
				<h1>${p ? I.svg(p.icon, 22) : ''} ${esc(p ? p.title : 'Projeto')}</h1>
				${viewSwitch(projectId, 'list')}
			</header>
			${captureBar()}
			<ul class="task-list">${shown}</ul>
			${extra}`
	}

	function overviewMain(kind) {
		const list = kind === 'upcoming' ? S.upcomingTasks() : S.overviewTasks()
		const title = kind === 'upcoming' ? 'Próximas' : 'Hoje'
		return `${banner()}
			<header class="page-head">
				<h1>${title}</h1>
			</header>
			${captureBar()}
			<ul class="task-list">${list.map(t => taskRow(t)).join('') || '<li class="empty">Nada por aqui.</li>'}</ul>`
	}

	function kanbanMain(projectId) {
		const p = S.project(projectId)
		const cards = S.kanbanTasks(projectId)
		const cols = D.buckets.map(b => {
			const col = cards.filter(t => t.bucket === b.id)
			return `<section class="bucket">
				<h2>${esc(b.title)} <span>${col.length}</span></h2>
				<ul>${col.map(t => `<li class="kcard ${t.done ? 'is-done' : ''}">
					<a href="${taskHref(t)}">
						<span class="task-title">${esc(t.title)}</span>
						${S.isSubtask(t) ? parentCrumb(t) : ''}
						${t.due ? `<time>${formatDue(t.due)}</time>` : ''}
					</a>
				</li>`).join('')}</ul>
			</section>`
		}).join('')
		return `${banner()}
			<header class="page-head">
				<h1>${p ? I.svg(p.icon, 22) : ''} ${esc(p ? p.title : '')}</h1>
				${viewSwitch(projectId, 'kanban')}
			</header>
			${captureBar()}
			<div class="board">${cols}</div>`
	}

	function showInListControl(task) {
		if (!S.isSubtask(task)) return ''
		const on = S.getShowInList(task.id)
		return `<label class="flag">
			<input type="checkbox" data-flag="${task.id}" ${on ? 'checked' : ''}>
			<span>Mostrar na lista</span>
			<small>Quando ligado, esta subtarefa também aparece em Visão geral, Próximas e no quadro.</small>
		</label>`
	}

	function detailMain(taskId) {
		const task = S.task(taskId)
		if (!task) return `<p>Tarefa não encontrada.</p>`
		const p = S.project(task.projectId)
		const parent = S.parent(task)
		const kids = S.children(task.id)
		return `${banner()}
			<header class="page-head">
				<a class="back" href="${href('list', { project: task.projectId })}">${I.svg('back', 16)} ${esc(p ? p.title : 'Lista')}</a>
				<h1>${esc(task.title)}</h1>
			</header>
			<div class="detail">
				<p class="detail-meta">${p ? projectDot(p) + esc(p.title) : ''}
					${parent ? ` · subtarefa de <a href="${href('detail', { task: parent.id, project: parent.projectId })}">${esc(parent.title)}</a>` : ''}
					${task.due ? ` · vence ${formatDue(task.due)}` : ''}
				</p>
				${showInListControl(task)}
				${task.notes ? `<p class="notes">${esc(task.notes)}</p>` : '<p class="notes is-empty">Sem descrição.</p>'}
				${kids.length ? `<h2>Subtarefas</h2><ul class="task-list">${kids.map(c => taskRow(c, { nested: true })).join('')}</ul>` : ''}
			</div>`
	}

	function inspector(taskId) {
		const task = S.task(taskId) || S.overviewTasks()[0] || D.tasks[0]
		if (!task) return `<aside class="inspector"><p>Selecione uma tarefa.</p></aside>`
		const p = S.project(task.projectId)
		const parent = S.parent(task)
		const kids = S.children(task.id)
		return `<aside class="inspector" aria-label="Detalhe">
			<div class="insp-head">
				${p ? `<span class="picon color-${p.color}">${I.svg(p.icon, 16)}</span>` : ''}
				<strong>${esc(task.title)}</strong>
			</div>
			<p class="detail-meta">${parent ? `de ${esc(parent.title)}` : 'Tarefa'} ${task.due ? '· ' + formatDue(task.due) : ''}</p>
			${showInListControl(task)}
			${task.notes ? `<p class="notes">${esc(task.notes)}</p>` : ''}
			<div class="insp-actions">
				<button type="button" class="btn btn-primary">${I.svg('check', 14)} Concluir</button>
				<a class="btn btn-ghost" href="${href('detail', { task: task.id, project: task.projectId })}">Abrir</a>
			</div>
			${kids.length ? `<h2>Subtarefas</h2><ul class="task-list compact">${kids.map(c => taskRow(c, { nested: true })).join('')}</ul>` : ''}
		</aside>`
	}

	function pinButton() {
		if (proto.version !== 'a-rail') return ''
		return `<button type="button" class="pin" aria-pressed="false" aria-label="Fixar menu">${I.svg('pin', 16)}</button>`
	}

	function menuToggle() {
		return `<button type="button" class="menu-toggle" aria-label="Abrir menu">${I.svg('menu', 20)}</button>`
	}

	function shell(mainInner, extra) {
		const projectId = qs('project', proto.page === 'list' || proto.page === 'kanban' ? 'casa' : '')
		const activeGlobal = proto.page === 'list' || proto.page === 'kanban' || proto.page === 'detail' ? 'projects' : proto.page
		const taskId = qs('task', '')
		const insp = proto.version === 'c-split' ? inspector(taskId || (S.overviewTasks()[0] || {}).id) : ''

		if (proto.version === 'b-blotter') {
			return `<div class="app blotter" data-page="${proto.page}">
				${menuToggle()}
				<header class="top">
					${brand()}
					${globalNav(activeGlobal)}
					<button type="button" class="btn btn-primary btn-tool">${I.svg('plus', 16)} Nova</button>
				</header>
				<div class="pills-wrap">${projectNav(projectId)}</div>
				<div class="stage">
					<main id="main">${mainInner}</main>
				</div>
			</div>`
		}

		if (proto.version === 'c-split') {
			return `<div class="app split${proto.page === 'detail' ? ' insp-open' : ''}" data-page="${proto.page}">
				${menuToggle()}
				<aside class="rail">
					${brand()}
					${globalNav(activeGlobal)}
					${projectNav(projectId)}
				</aside>
				<main id="main">${mainInner}</main>
				${insp}
			</div>`
		}

		return `<div class="app rail" data-page="${proto.page}">
			${menuToggle()}
			<aside class="rail">
				${brand()}
				${pinButton()}
				${globalNav(activeGlobal)}
				${projectNav(projectId)}
			</aside>
			<main id="main">${mainInner}</main>
			${extra || ''}
		</div>`
	}

	function mainForPage() {
		const projectId = qs('project', 'casa')
		const taskId = qs('task', 't1')
		switch (proto.page) {
			case 'upcoming': return overviewMain('upcoming')
			case 'list': return listMain(projectId)
			case 'kanban': return kanbanMain(projectId)
			case 'detail': return detailMain(taskId)
			default: return overviewMain('overview')
		}
	}

	function bind() {
		document.addEventListener('change', e => {
			const t = e.target
			if (t && t.matches('input[data-flag]')) {
				S.setShowInList(t.getAttribute('data-flag'), t.checked)
				render()
			}
		})
		document.addEventListener('click', e => {
			const pin = e.target.closest('.pin')
			if (pin) {
				document.querySelector('.app')?.classList.toggle('is-pinned')
				const on = document.querySelector('.app')?.classList.contains('is-pinned')
				pin.setAttribute('aria-pressed', on ? 'true' : 'false')
			}
			const mt = e.target.closest('.menu-toggle')
			if (mt) document.querySelector('.app')?.classList.toggle('menu-open')
			if (e.target.closest('[data-noop]')) e.preventDefault()
		})
		window.addEventListener('proto:flags', () => render())
	}

	function render() {
		const root = document.getElementById('app')
		if (!root) return
		const prev = root.querySelector('.app')
		const pinned = prev?.classList.contains('is-pinned')
		const menuOpen = prev?.classList.contains('menu-open')
		root.innerHTML = shell(mainForPage())
		const next = root.querySelector('.app')
		if (pinned) {
			next?.classList.add('is-pinned')
			next?.querySelector('.pin')?.setAttribute('aria-pressed', 'true')
		}
		if (menuOpen) next?.classList.add('menu-open')
	}

	window.ProtoApp = { render, href }
	document.addEventListener('DOMContentLoaded', () => {
		bind()
		render()
	})
})()
