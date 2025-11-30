// ==========================================
// CONFIGURACIÓN GLOBAL
// ==========================================
let paginaActual = 1;
const LIMITE_POR_PAGINA = 6; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. Al iniciar, cargamos la paginación por defecto (RF-6)
    iniciarPaginacion(); 

    // 2. Configuración del Buscador (RF-18 Existente)
    const btnBuscar = document.getElementById('btn-buscar');
    const inputBuscar = document.getElementById('input-buscar');

    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => {
            manejarBusqueda(inputBuscar.value);
        });
    }
    
    // Búsqueda al presionar Enter
    if (inputBuscar) {
        inputBuscar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') manejarBusqueda(inputBuscar.value);
        });
    }
});

// ==========================================
// LÓGICA DE CONTROL (Búsqueda vs Paginación)
// ==========================================
function manejarBusqueda(texto) {
    const controlesPaginacion = document.getElementById('controles-paginacion');
    
    if (texto.trim() === '') {
        // Si borran el texto, volvemos a la paginación normal
        if(controlesPaginacion) controlesPaginacion.style.display = 'flex';
        cargarPagina(1); // Volver a pág 1
    } else {
        // Si escriben algo, usamos la búsqueda antigua y ocultamos paginación
        if(controlesPaginacion) controlesPaginacion.style.display = 'none';
        cargarObrasBuscador(texto);
    }
}

// ==========================================
// PARTE 1: NUEVA PAGINACIÓN (RF-6)
// ==========================================
async function iniciarPaginacion() {
    // Configurar los botones de los controles nuevos
    const btnAnt = document.getElementById('btn-ant');
    const btnSig = document.getElementById('btn-sig');

    if(btnAnt) btnAnt.addEventListener('click', () => cambiarPagina(-1));
    if(btnSig) btnSig.addEventListener('click', () => cambiarPagina(1));
    
    // Cargar la primera página
    await cargarPagina(1);
}

async function cargarPagina(pagina) {
    const contenedor = document.querySelector('.contenedor-obras');
    const infoSpan = document.getElementById('info-pagina');
    const btnAnt = document.getElementById('btn-ant');
    const btnSig = document.getElementById('btn-sig');

    // Feedback visual de carga
    contenedor.style.opacity = '0.5';

    try {
        // Usamos la API HÍBRIDA (La que soporta modo offline/online)
        const res = await fetch(`/api/obras-paginadas?page=${pagina}&limit=${LIMITE_POR_PAGINA}`);
        const dataJson = await res.json();
        
        const obras = dataJson.data;
        const totalPaginas = dataJson.pages;

        // Limpiar y Renderizar
        contenedor.innerHTML = ''; 

        if (obras.length === 0) {
            contenedor.innerHTML = '<h3 style="text-align:center; width:100%; color:white;">No hay obras disponibles.</h3>';
            return;
        }

        renderizarTarjetas(obras, contenedor);

        // Actualizar controles
        if(infoSpan) infoSpan.innerText = `Página ${dataJson.page} de ${dataJson.pages}`;
        paginaActual = dataJson.page;

        if(btnAnt) btnAnt.disabled = (paginaActual === 1);
        if(btnSig) btnSig.disabled = (paginaActual >= totalPaginas);

    } catch (error) {
        console.error("Error paginación:", error);
        contenedor.innerHTML = '<h3 style="color:red; text-align:center;">Error de conexión con la API (Paginación).</h3>';
    } finally {
        contenedor.style.opacity = '1';
    }
}

function cambiarPagina(delta) {
    const nuevaPagina = paginaActual + delta;
    if (nuevaPagina > 0) {
        cargarPagina(nuevaPagina);
        // Scroll suave al inicio de la lista
        const titulo = document.querySelector('.titulo-listado');
        if(titulo) titulo.scrollIntoView({ behavior: 'smooth' });
    }
}

// ==========================================
// PARTE 2: BÚSQUEDA ANTIGUA (RF-18)
// ==========================================
async function cargarObrasBuscador(busqueda) {
    const contenedor = document.querySelector('.contenedor-obras');
    contenedor.innerHTML = '<h3 style="color:white; width:100%; text-align:center;">Buscando...</h3>';

    try {
        // Usamos la API ORIGINAL antigua para búsquedas
        const url = `/api/obras?busqueda=${busqueda}`;
        const respuesta = await fetch(url);
        const obras = await respuesta.json();

        contenedor.innerHTML = '';

        if (obras.length === 0) {
            contenedor.innerHTML = '<h3 style="color:white; width:100%; text-align:center;">No se encontraron resultados para tu búsqueda.</h3>';
            return;
        }

        renderizarTarjetas(obras, contenedor);

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<h3 style="color:red">Error al buscar obras.</h3>';
    }
}

// ==========================================
// UTILIDAD COMÚN (Para no repetir HTML)
// ==========================================
function renderizarTarjetas(listaObras, contenedor) {
    listaObras.forEach(obra => {
        // Validar imágenes
        const imagen = (obra.imagenes && obra.imagenes.length > 0) ? obra.imagenes[0] : '/Style/Imagenes/RegistroObra.jpg';
        
        // Validar autor (si viene populado o simulado)
        let nombreAutor = 'Autor Desconocido';
        if (obra.autor && obra.autor.nombre) {
            nombreAutor = obra.autor.nombre;
        }

        const card = document.createElement('div');
        card.className = 'tarjeta-obra';
        card.innerHTML = `
            <div class="imagen-obra">
                <img src="${imagen}" alt="${obra.titulo}">
            </div>
            <div class="info-obra">
                <h3 class="titulo-obra">${obra.titulo}</h3>
                <p class="detalle-obra">Autor: <span class="valor-detalle">${nombreAutor}</span></p>
                <p class="detalle-obra">Categoría: <span class="valor-detalle">${obra.categoria}</span></p>
                <p class="detalle-obra">Año: <span class="valor-detalle">${obra.anio}</span></p>
                <a href="ObrasDetalle.html?id=${obra._id}" class="boton-ver-detalle">Ver Detalle</a>
            </div>
        `;
        contenedor.appendChild(card);
    });
}