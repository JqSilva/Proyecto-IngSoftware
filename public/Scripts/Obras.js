document.addEventListener('DOMContentLoaded', () => {
    cargarObras(); // Carga inicial (todas)

    // Escuchar el botón de búsqueda
    const btnBuscar = document.getElementById('btn-buscar');
    const inputBuscar = document.getElementById('input-buscar');

    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => {
            const texto = inputBuscar.value;
            cargarObras(texto); // Carga con filtro
        });
    }
    
    // Búsqueda al presionar Enter
    inputBuscar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') cargarObras(inputBuscar.value);
    });
});

async function cargarObras(busqueda = '') {
    const contenedor = document.querySelector('.contenedor-obras');
    contenedor.innerHTML = '<h3 style="color:white; width:100%; text-align:center;">Cargando...</h3>';

    try {
        // Llamamos al backend con el parámetro de búsqueda si existe
        const url = busqueda ? `/api/obras?busqueda=${busqueda}` : '/api/obras';
        const respuesta = await fetch(url);
        const obras = await respuesta.json();

        contenedor.innerHTML = ''; // Limpiar

        if (obras.length === 0) {
            contenedor.innerHTML = '<h3 style="color:white; width:100%; text-align:center;">No se encontraron obras.</h3>';
            return;
        }

        obras.forEach(obra => {
            // Usar imagen real o placeholder
            const imagen = (obra.imagenes && obra.imagenes.length > 0) ? obra.imagenes[0] : 'https://via.placeholder.com/300x200?text=Sin+Imagen';
            
            // Si el autor viene poblado (objeto) usamos su nombre, si no, "Desconocido"
            // Nota: En Mongo, si usamos populate, autor es un objeto.
            const nombreAutor = (obra.autor && obra.autor.nombre) ? obra.autor.nombre : 'Autor Desconocido';

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

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<h3 style="color:red">Error al cargar obras.</h3>';
    }
}