const App = {
    state: {
        clientes: [],
        view: 'clientes', // clientes, nuevo-cliente
        filtro: { nombre: '', telefono: '' }
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

        modalBody.innerHTML = `
            <h2 style="margin-bottom: 1rem;">Contactos del Cliente</h2>
            <div style="max-height: 40vh; overflow-y: auto; margin-bottom: 2rem;">
                ${contactos.length ? contactos.map(c => `
                    <div style="background: rgba(255,255,255,0.05); padding: 1rem; margin-bottom: 0.5rem; border-radius: 8px; display: flex; justify-content: space-between;">
                        <div>
                            <strong>${c.nombreCompleto}</strong><br>
                            <small>${c.telefono || ''}</small>
                        </div>
                        <button onclick="App.eliminarContacto(${c.id}, ${clienteId})" style="background:none; border:none; color: #ef4444; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `).join('') : '<p>No hay contactos.</p>'}
            </div>
            
            <h3>Agregar Contacto</h3>
            <form onsubmit="App.agregarContacto(event, ${clienteId})">
                <input type="hidden" name="clienteId" value="${clienteId}">
                <div class="form-group">
                    <input type="text" name="nombreCompleto" placeholder="Nombre Contacto" class="form-control" required>
                </div>
                <div class="form-group">
                    <input type="text" name="telefono" placeholder="Teléfono" class="form-control">
                </div>
                 <div class="form-group">
                    <input type="text" name="direccion" placeholder="Dirección" class="form-control">
                </div>
                <button type="submit" class="btn-primary">Agregar</button>
            </form>
        `;

        modal.classList.remove('hidden');

        // Close handler
        document.querySelector('.close-modal').onclick = () => modal.classList.add('hidden');
    },

    async agregarContacto(event, clienteId) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = {
            clienteId: parseInt(clienteId),
            nombreCompleto: formData.get('nombreCompleto'),
            telefono: formData.get('telefono'),
            direccion: formData.get('direccion')
        };

        try {
            await API.post('contactos', data);
            // Reload contacts in modal
            this.verContactos(clienteId);
        } catch (e) {
            this.Modal.error('Error al agregar contacto');
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
