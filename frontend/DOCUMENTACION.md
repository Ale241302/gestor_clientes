# Documentación del Frontend

## Estructura
- **Vanilla JS**: Se optó por JavaScript sin frameworks para cumplir con la simplicidad y eficiencia, manteniendo una estructura modular (`App` object).
- **Componentes**: `index.html` sirve como SPA (Single Page Application) ligera, inyectando contenido dinámicamente en `#content-area`.

## Diseño y Responsividad
- **Grid/Flexbox**: Usados para el layout general y las tarjetas de clientes.
- **Unidades vw/vh**:
    - `w-screen` / `h-screen` aseguran que la app ocupe todo el viewport.
    - Fuentes y paddings a veces usan `vw` para escalar con el ancho del dispositivo, aunque se priorizó `rem` para accesibilidad de texto.
- **Glassmorphism**: Estilo visual moderno usando `backdrop-filter: blur`, dando una apariencia premium y de "aplicación nativa".

## Flujo de Datos
1. `App.init()` carga la vista inicial.
2. `API module` (`api.js`) centraliza `fetch`, manejando errores y serialización JSON.
3. `App state` guarda la lista de clientes localmente para re-renderizados rápidos (filtros en cliente opcionales, actualmente hace fetch en búsqueda).
