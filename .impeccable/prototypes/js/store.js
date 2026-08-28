;(function () {
	const KEY = 'vikunja-proto-show-in-list'
	const { tasks } = window.PROTO_DATA

	function read() {
		try {
			return JSON.parse(localStorage.getItem(KEY) || '{}')
		} catch {
			return {}
		}
	}

	function write(map) {
		localStorage.setItem(KEY, JSON.stringify(map))
	}

	function seed() {
		const map = read()
		let changed = false
		tasks.forEach(t => {
			if (t._demoShow && map[t.id] === undefined) {
				map[t.id] = true
				changed = true
			}
		})
		if (changed) write(map)
	}

	seed()

	window.Store = {
		getShowInList(id) {
			return !!read()[id]
		},
		setShowInList(id, value) {
			const map = read()
			map[id] = !!value
			write(map)
			window.dispatchEvent(new CustomEvent('proto:flags'))
		},
		toggleShowInList(id) {
			this.setShowInList(id, !this.getShowInList(id))
		},
		task(id) {
			return tasks.find(t => t.id === id)
		},
		project(id) {
			return window.PROTO_DATA.projects.find(p => p.id === id)
		},
		parent(task) {
			return task.parentId ? this.task(task.parentId) : null
		},
		children(id) {
			return tasks.filter(t => t.parentId === id)
		},
		isSubtask(task) {
			return !!task.parentId
		},
		showsLoose(task) {
			if (!this.isSubtask(task)) return true
			return this.getShowInList(task.id)
		},
		looseTasks(list) {
			return list.filter(t => this.showsLoose(t))
		},
		inProject(projectId) {
			return tasks.filter(t => t.projectId === projectId)
		},
		overviewTasks() {
			return this.looseTasks(tasks.filter(t => !t.done))
		},
		upcomingTasks() {
			return this.looseTasks(tasks.filter(t => t.due && !t.done))
				.sort((a, b) => a.due.localeCompare(b.due))
		},
		kanbanTasks(projectId) {
			return this.looseTasks(this.inProject(projectId))
		},
	}
})()
