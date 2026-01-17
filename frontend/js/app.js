const App = {
    state: {
        clientes: [],
        view: 'clientes', // clientes, nuevo-cliente
        filtro: { nombre: '', telefono: '' },
        editingContactoId: null
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
                okBtn.style.width = 'auto'; // Override full width
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

    async init() {
        console.log('App iniciada');
        this.render();
        await this.cargarClientes();
    },

    async cargarClientes() {
        try {
            const clientes = await API.get('clientes');
            this.state.clientes = clientes;
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
        return `
            <div class="search-bar" style="margin-bottom: 2rem; display: flex; gap: 1rem;">
                <input type="text" id="busqueda-nombre" placeholder="Buscar por nombre..." class="form-control" value="${this.state.filtro.nombre}">
                <input type="text" id="busqueda-telefono" placeholder="Buscar por teléfono..." class="form-control" value="${this.state.filtro.telefono}">
                <button onclick="App.buscar()" class="btn-primary" style="width: auto; margin: 0;">Buscar</button>
            </div>
            <div class="grid-container">
                ${this.state.clientes.map(cliente => `
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
        `;
    },

    renderFormularioCliente() {
        return `
            <div class="card" style="max-width: 600px; margin: 0 auto;">
                <form onsubmit="App.guardarCliente(event)">
                    <div class="form-group">
                        <label>Nombre Completo</label>
                        <input type="text" name="nombreCompleto" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Teléfono</label>
                        <input type="text" name="telefono" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Dirección</label>
                        <input type="text" name="direccion" class="form-control">
                    </div>
                    <button type="submit" class="btn-primary">Guardar Cliente</button>
                </form>
            </div>
        `;
    },

    setupBusqueda() {
        // Simple manual wiring if needed
    },

    async buscar() {
        const nombre = document.getElementById('busqueda-nombre').value;
        const telefono = document.getElementById('busqueda-telefono').value;

        try {
            const clientes = await API.get(`clientes/buscar?nombre=${nombre}&telefono=${telefono}`);
            this.state.clientes = clientes;
            this.render(); // Re-render grid only preferably, but full render is easier
        } catch (e) {
            console.error(e);
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
                    <input type="text" name="nombreCompleto" class="form-control" value="${cliente.nombreCompleto}" required>
                </div>
                <div class="form-group">
                    <label>Teléfono</label>
                    <input type="text" name="telefono" class="form-control" value="${cliente.telefono || ''}">
                </div>
                <div class="form-group">
                    <label>Dirección</label>
                    <input type="text" name="direccion" class="form-control" value="${cliente.direccion || ''}">
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
                    <input type="text" name="nombreCompleto" id="input-contacto-nombre" placeholder="Nombre del Contacto" class="form-control" required>
                </div>
                <div class="form-group">
                    <input type="text" name="telefono" id="input-contacto-telefono" placeholder="Número de Teléfono" class="form-control">
                </div>
                <div class="form-group">
                    <input type="text" name="direccion" id="input-contacto-direccion" placeholder="Dirección Postal" class="form-control">
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
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => App.init());
