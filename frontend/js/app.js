const App = {
    state: {
        clientes: [],
        clientesFiltrados: [],
        view: 'clientes', // clientes, nuevo-cliente
        filtro: { nombre: '', telefono: '' },
        ordenamiento: 'nombre-asc', // nombre-asc, nombre-desc, telefono-asc, telefono-desc
        editingContactoId: null
    },

    Theme: {
        init() {
            // Check local storage or system preference
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                this.setTheme(savedTheme);
            } else {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.setTheme(prefersDark ? 'dark' : 'light');
            }

            // Listen for system changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        },

        toggle() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        },

        setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            const icon = document.querySelector('#theme-toggle i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            }
        }
    },

    Modal: {
        show(title, message, type = 'info', onConfirm = null) {
            const modal = document.getElementById('generic-modal');
            const titleEl = document.getElementById('generic-modal-title');
            const msgEl = document.getElementById('generic-modal-message');
            const actionsEl = document.getElementById('generic-modal-actions');

            titleEl.textContent = title;
            msgEl.textContent = message;
            actionsEl.innerHTML = '';

            if (type === 'confirm') {
                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'btn-secondary';
                cancelBtn.textContent = 'Cancelar';
                cancelBtn.onclick = () => this.close();

                const confirmBtn = document.createElement('button');
                confirmBtn.className = 'btn-danger';
                confirmBtn.textContent = 'Confirmar';
                confirmBtn.onclick = () => {
                    this.close();
                    if (onConfirm) onConfirm();
                };

                actionsEl.appendChild(cancelBtn);
                actionsEl.appendChild(confirmBtn);
            } else {
                const okBtn = document.createElement('button');
                okBtn.className = 'btn-primary';
                okBtn.textContent = 'Aceptar';
                okBtn.onclick = () => this.close();
                actionsEl.appendChild(okBtn);
            }

            modal.classList.remove('hidden');
        },

        close() {
            document.getElementById('generic-modal').classList.add('hidden');
        },

        alert(message) {
            this.show('Atención', message, 'info');
        },

        success(message) {
            this.show('Éxito', message, 'info');
        },

        error(message) {
            this.show('Error', message, 'info');
        },

        confirm(message, onConfirm) {
            this.show('Confirmación', message, 'confirm', onConfirm);
        }
    },

    soloNumeros(event) {
        // Permitir solo números y teclas de control básicas
        event.target.value = event.target.value.replace(/[^0-9]/g, '');
    },

    soloLetras(event) {
        // Permitir solo letras (incluyendo acentos y ñ) y espacios
        event.target.value = event.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    },

    soloDireccion(event) {
        // Permitir letras, números, espacios, # y -
        event.target.value = event.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s#\-]/g, '');
    },

    async init() {
        console.log('App iniciada');
        this.Theme.init();
        this.render();
        await this.cargarClientes();
    },

    async cargarClientes() {
        try {
            const clientes = await API.get('clientes');
            this.state.clientes = clientes;
            this.aplicarFiltrosYOrdenamiento();
            this.render();
        } catch (error) {
            this.Modal.error('Error al cargar clientes');
        }
    },

    navegar(ruta) {
        this.state.view = ruta;
        document.querySelectorAll('.nav-links li').forEach(el => el.classList.remove('active'));
        // Actualizar active en sidebar (simplificado)
        this.render();
    },

    render() {
        const contentArea = document.getElementById('content-area');
        const pageTitle = document.getElementById('page-title');

        if (this.state.view === 'clientes') {
            pageTitle.textContent = 'Listado de Clientes';
            contentArea.innerHTML = this.renderClientesView();
            this.setupBusqueda();
        } else if (this.state.view === 'nuevo-cliente') {
            pageTitle.textContent = 'Nuevo Cliente';
            contentArea.innerHTML = this.renderFormularioCliente();
        }
    },

    renderClientesView() {
        const hayClientes = this.state.clientesFiltrados.length > 0;

        return `
            <div class="search-bar" style="margin-bottom: 2rem; display: flex; gap: 1rem; align-items: center;">
                <input type="text" id="busqueda-nombre" placeholder="Buscar por nombre..." class="form-control" value="${this.state.filtro.nombre}">
                <input type="text" id="busqueda-telefono" placeholder="Buscar por teléfono..." class="form-control" oninput="App.soloNumeros(event)" value="${this.state.filtro.telefono}">
                <select id="ordenamiento" class="form-control" style="width: 200px;">
                    <option value="nombre-asc" ${this.state.ordenamiento === 'nombre-asc' ? 'selected' : ''}>Nombre A-Z</option>
                    <option value="nombre-desc" ${this.state.ordenamiento === 'nombre-desc' ? 'selected' : ''}>Nombre Z-A</option>
                    <option value="telefono-asc" ${this.state.ordenamiento === 'telefono-asc' ? 'selected' : ''}>Teléfono Ascendente</option>
                    <option value="telefono-desc" ${this.state.ordenamiento === 'telefono-desc' ? 'selected' : ''}>Teléfono Descendente</option>
                </select>
            </div>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem;">${this.state.clientesFiltrados.length} cliente(s) encontrado(s)</p>
            ${hayClientes ? `
                <div class="grid-container">
                    ${this.state.clientesFiltrados.map(cliente => `
                        <div class="card" onclick="App.editarCliente(${cliente.id})" style="cursor: pointer;">
                            <div class="card-header">
                                <div class="card-title">${cliente.nombreCompleto}</div>
                                <div class="card-actions" onclick="event.stopPropagation()">
                                    <button onclick="App.verContactos(${cliente.id})" title="Ver Contactos"><i class="fa-solid fa-address-book"></i></button>
                                    <button onclick="App.eliminarCliente(${cliente.id})" class="delete-btn" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                                </div>
                            </div>
                            <p style="color: var(--text-muted); margin-bottom: 0.5rem;"><i class="fa-solid fa-phone"></i> ${cliente.telefono || 'Sin teléfono'}</p>
                            <p style="color: var(--text-muted);"><i class="fa-solid fa-location-dot"></i> ${cliente.direccion || 'Sin dirección'}</p>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div style="text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
                    <i class="fa-solid fa-users-slash" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3 style="color: var(--text-main); margin-bottom: 0.5rem;">No se encontraron clientes</h3>
                    <p>Intenta ajustar tus filtros de búsqueda o agrega un nuevo cliente.</p>
                </div>
            `}
        `;
    },

    renderFormularioCliente() {
        return `
            <div class="card" style="max-width: 600px; margin: 0 auto;">
                <form onsubmit="App.guardarCliente(event)">
                    <div class="form-group">
                        <label>Nombre Completo</label>
                        <input type="text" name="nombreCompleto" class="form-control" oninput="App.soloLetras(event)" required>
                    </div>
                    <div class="form-group">
                        <label>Teléfono</label>
                        <input type="text" name="telefono" class="form-control" oninput="App.soloNumeros(event)">
                    </div>
                    <div class="form-group">
                        <label>Dirección</label>
                        <input type="text" name="direccion" class="form-control" oninput="App.soloDireccion(event)">
                    </div>
                    <button type="submit" class="btn-primary">Guardar Cliente</button>
                </form>
            </div>
        `;
    },

    setupBusqueda() {
        const inputNombre = document.getElementById('busqueda-nombre');
        const inputTelefono = document.getElementById('busqueda-telefono');
        const selectOrdenamiento = document.getElementById('ordenamiento');

        if (inputNombre) {
            inputNombre.addEventListener('input', (e) => {
                this.state.filtro.nombre = e.target.value;
                this.aplicarFiltrosYOrdenamiento();
                this.actualizarVista();
            });
        }

        if (inputTelefono) {
            inputTelefono.addEventListener('input', (e) => {
                this.state.filtro.telefono = e.target.value;
                this.aplicarFiltrosYOrdenamiento();
                this.actualizarVista();
            });
        }

        if (selectOrdenamiento) {
            selectOrdenamiento.addEventListener('change', (e) => {
                this.state.ordenamiento = e.target.value;
                this.aplicarFiltrosYOrdenamiento();
                this.actualizarVista();
            });
        }
    },

    aplicarFiltrosYOrdenamiento() {
        let clientesFiltrados = [...this.state.clientes];

        // Aplicar filtro por nombre
        if (this.state.filtro.nombre) {
            const nombreBusqueda = this.state.filtro.nombre.toLowerCase();
            clientesFiltrados = clientesFiltrados.filter(cliente =>
                cliente.nombreCompleto.toLowerCase().includes(nombreBusqueda)
            );
        }

        // Aplicar filtro por teléfono
        if (this.state.filtro.telefono) {
            clientesFiltrados = clientesFiltrados.filter(cliente =>
                cliente.telefono && cliente.telefono.includes(this.state.filtro.telefono)
            );
        }

        // Aplicar ordenamiento
        clientesFiltrados.sort((a, b) => {
            switch (this.state.ordenamiento) {
                case 'nombre-asc':
                    return a.nombreCompleto.localeCompare(b.nombreCompleto);
                case 'nombre-desc':
                    return b.nombreCompleto.localeCompare(a.nombreCompleto);
                case 'telefono-asc':
                    return (a.telefono || '').localeCompare(b.telefono || '');
                case 'telefono-desc':
                    return (b.telefono || '').localeCompare(a.telefono || '');
                default:
                    return 0;
            }
        });

        this.state.clientesFiltrados = clientesFiltrados;
    },

    actualizarVista() {
        // Solo actualizar la vista sin recargar todo
        const contentArea = document.getElementById('content-area');
        if (this.state.view === 'clientes') {
            contentArea.innerHTML = this.renderClientesView();
            this.setupBusqueda();
        }
    },

    async guardarCliente(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = {
            nombreCompleto: formData.get('nombreCompleto'),
            telefono: formData.get('telefono'),
            direccion: formData.get('direccion')
        };

        try {
            await API.post('clientes', data);
            this.Modal.success('Cliente guardado!');
            this.navegar('clientes');
            this.cargarClientes();
        } catch (e) {
            this.Modal.error('Error al guardar');
        }
    },

    editarCliente(id) {
        const cliente = this.state.clientes.find(c => c.id === id);
        if (!cliente) return;

        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');

        modalBody.innerHTML = `
            <h2 style="margin-bottom: 2rem;">Editar Cliente</h2>
            <form onsubmit="App.actualizarCliente(event, ${cliente.id})">
                <div class="form-group">
                    <label>Nombre Completo</label>
                    <input type="text" name="nombreCompleto" class="form-control" value="${cliente.nombreCompleto}" oninput="App.soloLetras(event)" required>
                </div>
                <div class="form-group">
                    <label>Teléfono</label>
                    <input type="text" name="telefono" class="form-control" value="${cliente.telefono || ''}" oninput="App.soloNumeros(event)">
                </div>
                <div class="form-group">
                    <label>Dirección</label>
                    <input type="text" name="direccion" class="form-control" value="${cliente.direccion || ''}" oninput="App.soloDireccion(event)">
                </div>
                <button type="submit" class="btn-primary">Actualizar Cliente</button>
            </form>
        `;

        modal.classList.remove('hidden');
        document.querySelector('.close-modal').onclick = () => modal.classList.add('hidden');
    },

    async actualizarCliente(event, id) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = {
            id: id,
            nombreCompleto: formData.get('nombreCompleto'),
            telefono: formData.get('telefono'),
            direccion: formData.get('direccion')
        };

        try {
            await API.put(`clientes/${id}`, data);
            document.getElementById('modal').classList.add('hidden');
            this.Modal.success('Cliente actualizado correctamente');
            this.cargarClientes();
        } catch (e) {
            this.Modal.error('Error al actualizar cliente');
        }
    },

    async eliminarCliente(id) {
        this.Modal.confirm('¿Estás seguro? Se eliminarán también los contactos.', async () => {
            try {
                await API.delete(`clientes/${id}`);
                this.cargarClientes();
            } catch (e) {
                this.Modal.error('Error al eliminar');
            }
        });
    },

    async verContactos(clienteId) {
        // Load contacts and show modal
        try {
            const contactos = await API.get(`contactos/cliente/${clienteId}`);
            this.mostrarModalContactos(clienteId, contactos);
        } catch (e) {
            this.Modal.error('Error al cargar contactos');
        }
    },

    mostrarModalContactos(clienteId, contactos) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');

        // Reset editing state when opening
        this.state.editingContactoId = null;

        modalBody.innerHTML = `
            <h2 style="margin-bottom: 1.5rem;">Contactos del Cliente</h2>
            <div id="contactos-list" style="max-height: 40vh; overflow-y: auto; margin-bottom: 2.5rem;">
                ${contactos.length ? contactos.map(c => `
                    <div style="background: rgba(255,255,255,0.05); padding: 1rem; margin-bottom: 0.8rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--glass-border);">
                        <div>
                            <strong style="color: var(--text-main);">${c.nombreCompleto}</strong><br>
                            <small style="color: var(--text-muted);">${c.telefono || 'Sin teléfono'}</small>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button onclick="App.prepararEdicionContacto(${c.id}, ${clienteId})" style="background:none; border:none; color: #10b981 !important; cursor: pointer; font-size: 1.1rem;" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                            <button onclick="App.eliminarContacto(${c.id}, ${clienteId})" style="background:none; border:none; color: #ef4444 !important; cursor: pointer; font-size: 1.1rem;" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                `).join('') : '<p style="text-align: center; color: var(--text-muted);">No hay contactos registrados.</p>'}
            </div>
            
            <h3 id="form-contacto-title" style="margin-bottom: 1.5rem; color: var(--text-main);">Agregar Nuevo Contacto</h3>
            <form id="form-contacto" onsubmit="App.procesarContacto(event, ${clienteId})">
                <input type="hidden" name="id" id="input-contacto-id" value="">
                <div class="form-group">
                    <input type="text" name="nombreCompleto" id="input-contacto-nombre" placeholder="Nombre del Contacto" class="form-control" oninput="App.soloLetras(event)" required>
                </div>
                <div class="form-group">
                    <input type="text" name="telefono" id="input-contacto-telefono" placeholder="Número de Teléfono" class="form-control" oninput="App.soloNumeros(event)">
                </div>
                <div class="form-group">
                    <input type="text" name="direccion" id="input-contacto-direccion" placeholder="Dirección Postal" class="form-control" oninput="App.soloDireccion(event)">
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem; align-items: stretch;">
                    <button type="submit" id="btn-submit-contacto" class="btn-primary" style="margin-top: 0; flex: 2; height: 50px;">Agregar Contacto</button>
                    <button type="button" id="btn-cancelar-edicion" class="btn-danger" style="margin-top: 0; flex: 1; display: none; height: 50px; font-weight: 600; font-size: 1rem; padding: 0;" onclick="App.cancelarEdicionContacto(${clienteId})">Cancelar</button>
                </div>
            </form>
        `;

        modal.classList.remove('hidden');
        document.querySelector('.close-modal').onclick = () => modal.classList.add('hidden');
    },

    async prepararEdicionContacto(contactoId, clienteId) {
        try {
            // we could fetch it, but usually it's in the list or we can fetch by id
            const contacto = await API.get(`contactos/${contactoId}`);
            if (!contacto) return;

            this.state.editingContactoId = contactoId;

            document.getElementById('form-contacto-title').textContent = 'Editar Contacto';
            document.getElementById('btn-submit-contacto').textContent = 'Actualizar Cambios';
            document.getElementById('btn-cancelar-edicion').style.display = 'block';

            document.getElementById('input-contacto-id').value = contacto.id;
            document.getElementById('input-contacto-nombre').value = contacto.nombreCompleto;
            document.getElementById('input-contacto-telefono').value = contacto.telefono || '';
            document.getElementById('input-contacto-direccion').value = contacto.direccion || '';

            document.getElementById('input-contacto-nombre').focus();
        } catch (e) {
            this.Modal.error('Error al cargar datos del contacto');
        }
    },

    cancelarEdicionContacto(clienteId) {
        this.verContactos(clienteId); // Simplest way to reset everything
    },

    async procesarContacto(event, clienteId) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const id = formData.get('id');
        const data = {
            clienteId: parseInt(clienteId),
            nombreCompleto: formData.get('nombreCompleto'),
            telefono: formData.get('telefono'),
            direccion: formData.get('direccion')
        };

        try {
            if (this.state.editingContactoId) {
                data.id = parseInt(this.state.editingContactoId);
                await API.put(`contactos/${this.state.editingContactoId}`, data);
                this.Modal.success('Contacto actualizado');
            } else {
                await API.post('contactos', data);
                this.Modal.success('Contacto agregado');
            }
            this.verContactos(clienteId);
        } catch (e) {
            this.Modal.error('Error al procesar contacto');
        }
    },

    async eliminarContacto(id, clienteId) {
        this.Modal.confirm('¿Eliminar contacto?', async () => {
            try {
                await API.delete(`contactos/${id}`);
                this.verContactos(clienteId);
            } catch (e) {
                this.Modal.error('Error');
            }
        });
    },

    toggleFab() {
        const menu = document.getElementById('fab-menu');
        const icon = document.getElementById('fab-icon');
        menu.classList.toggle('hidden');

        if (menu.classList.contains('hidden')) {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-plus');
            icon.style.transform = 'rotate(0deg)';
        } else {
            icon.classList.remove('fa-plus');
            icon.classList.add('fa-xmark');
            // Or just rotate the plus
            icon.style.transform = 'rotate(135deg)';
        }
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => App.init());
