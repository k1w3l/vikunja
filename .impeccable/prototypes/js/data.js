window.PROTO_DATA = {
	synthetic: true,
	projects: [
		{ id: 'inbox', title: 'Inbox', icon: 'inbox', color: 'slate' },
		{ id: 'casa', title: 'Casa', icon: 'house', color: 'teal' },
		{ id: 'trabalho', title: 'Trabalho', icon: 'briefcase', color: 'blue' },
		{ id: 'homelab', title: 'Homelab', icon: 'cpu', color: 'amber' },
		{ id: 'saude', title: 'Saúde', icon: 'heart', color: 'rose' },
		{ id: 'financas', title: 'Finanças', icon: 'wallet', color: 'green' },
		{ id: 'compras', title: 'Compras', icon: 'bag', color: 'plum' },
		{ id: 'leitura', title: 'Leitura', icon: 'book', color: 'sky' },
		{ id: 'viagens', title: 'Viagens', icon: 'map', color: 'orange' },
		{ id: 'arquivo', title: 'Arquivo', icon: 'archive', color: 'stone' },
	],
	tasks: [
		{ id: 't1', projectId: 'casa', title: 'Trocar filtro da água', done: false, due: '2026-08-27', parentId: null, bucket: 'doing', notes: 'Filtro 10" no armário da lavanderia.' },
		{ id: 't1a', projectId: 'casa', title: 'Comprar filtro 10 polegadas', done: true, due: '2026-08-24', parentId: 't1', bucket: 'done', notes: '' },
		{ id: 't1b', projectId: 'casa', title: 'Instalar e abrir o registro', done: false, due: null, parentId: 't1', bucket: 'todo', notes: '' },
		{ id: 't2', projectId: 'casa', title: 'Agendar gás do botijão', done: false, due: '2026-08-28', parentId: null, bucket: 'todo', notes: '' },
		{ id: 't3', projectId: 'trabalho', title: 'Fechar relatório Q3', done: false, due: '2026-08-29', parentId: null, bucket: 'doing', notes: 'Números no sheet da pasta Finanças.' },
		{ id: 't3a', projectId: 'trabalho', title: 'Conferir horas lançadas', done: false, due: '2026-08-26', parentId: 't3', bucket: 'todo', notes: '' },
		{ id: 't3b', projectId: 'trabalho', title: 'Enviar PDF ao financeiro', done: false, due: null, parentId: 't3', bucket: 'todo', notes: '' },
		{ id: 't4', projectId: 'trabalho', title: 'Revisar proposta do cliente Norte', done: false, due: '2026-09-02', parentId: null, bucket: 'todo', notes: '' },
		{ id: 't5', projectId: 'homelab', title: 'Dump Vikunja para o outro host', done: false, due: '2026-08-30', parentId: null, bucket: 'todo', notes: 'CT 125 → restore com --preserve-config.' },
		{ id: 't5a', projectId: 'homelab', title: 'Copiar zip para o PCL', done: true, due: '2026-08-26', parentId: 't5', bucket: 'done', notes: '' },
		{ id: 't5b', projectId: 'homelab', title: 'Testar restore em banco vazio', done: false, due: null, parentId: 't5', bucket: 'todo', notes: '' },
		{ id: 't6', projectId: 'homelab', title: 'Renovar cert do Pangolin', done: false, due: '2026-09-12', parentId: null, bucket: 'todo', notes: '' },
		{ id: 't7', projectId: 'saude', title: 'Consulta oftalmo', done: false, due: '2026-09-04', parentId: null, bucket: 'todo', notes: '' },
		{ id: 't8', projectId: 'saude', title: 'Comprar vitamina D', done: false, due: null, parentId: null, bucket: 'todo', notes: '' },
		{ id: 't9', projectId: 'financas', title: 'Pagar IPTU parcela 8', done: false, due: '2026-08-31', parentId: null, bucket: 'todo', notes: '' },
		{ id: 't10', projectId: 'compras', title: 'Lista do mercado', done: false, due: '2026-08-27', parentId: null, bucket: 'todo', notes: '' },
		{ id: 't10a', projectId: 'compras', title: 'Café em grão', done: false, due: null, parentId: 't10', bucket: 'todo', notes: '' },
		{ id: 't10b', projectId: 'compras', title: 'Filtro de café', done: false, due: null, parentId: 't10', bucket: 'todo', notes: '' },
		{ id: 't11', projectId: 'leitura', title: 'Terminar capítulo 6', done: false, due: null, parentId: null, bucket: 'doing', notes: '' },
		{ id: 't12', projectId: 'inbox', title: 'Responder e-mail da escola', done: false, due: '2026-08-27', parentId: null, bucket: 'todo', notes: '' },
		{ id: 't13', projectId: 'viagens', title: 'Reservar hotel em Paraty', done: false, due: '2026-09-10', parentId: null, bucket: 'todo', notes: '' },
		{ id: 't13a', projectId: 'viagens', title: 'Comparar três pousadas', done: false, due: '2026-09-05', parentId: 't13', bucket: 'todo', notes: '' },
		{ id: 't14', projectId: 'inbox', title: 'Ideia: widget de hoje no Android', done: false, due: null, parentId: null, bucket: 'todo', notes: 'App oficial, não este repo.' },
	],
	buckets: [
		{ id: 'todo', title: 'A fazer' },
		{ id: 'doing', title: 'Em curso' },
		{ id: 'done', title: 'Feito' },
	],
}

window.PROTO_DATA.tasks.forEach(t => {
	if (t.id === 't3a') t._demoShow = true
})
