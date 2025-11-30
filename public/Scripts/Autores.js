document.addEventListener('DOMContentLoaded', () => {
    // Detectamos en qué página estamos buscando elementos únicos
    const esPaginaListado = document.getElementById('lista-autores-general');
    const esPaginaPerfil = document.getElementById('contenido-perfil');

    if (esPaginaListado) {
        ejecutarRF16_Listado();
    } else if (esPaginaPerfil) {
        ejecutarRF17_Perfil();
    }
});

/* --- RF-16: Lógica para Listado de Autores --- */
async function ejecutarRF16_Listado() {
    console.log("Cargando listado de autores...");
    const contenedor = document.getElementById('lista-autores-general');
    
    try {
        const respuesta = await fetch('/api/autores');
        const autores = await respuesta.json();
        
        contenedor.innerHTML = ''; // Limpiar carga

        if (autores.length === 0) {
            contenedor.innerHTML = '<h3 style="color: white;">No hay autores registrados aún.</h3>';
            return;
        }

        autores.forEach(autor => {
            const card = document.createElement('div');
            card.className = 'tarjeta-autor';
            const imagen = autor.foto || 'https://via.placeholder.com/150';

            card.innerHTML = `
                <img src="${imagen}" alt="${autor.nombre}" class="foto-autor">
                <h3 class="nombre-autor">${autor.nombre}</h3>
                <p class="bio-autor">${autor.biografia ? autor.biografia.substring(0, 50) + '...' : 'Sin biografía'}</p>
                <a href="AutoresPerfil.html?id=${autor._id}" class="boton-ver">Ver Perfil</a>
            `;
            contenedor.appendChild(card);
        });
    } catch (error) {
        console.error('Error RF-16:', error);
        contenedor.innerHTML = '<h3 style="color:red">Error de conexión.</h3>';
    }
}

/* --- RF-17: Lógica para Perfil de Autor --- */
async function ejecutarRF17_Perfil() {
    console.log("Cargando perfil de autor...");
    
    const params = new URLSearchParams(window.location.search);
    const idAutor = params.get('id');

    if (!idAutor) {
        alert("No se especificó un autor");
        window.location.href = 'Autores.html';
        return;
    }

    try {
        const respuesta = await fetch(`/api/autores/${idAutor}`);
        if (!respuesta.ok) throw new Error('Autor no encontrado');
        
        const datos = await respuesta.json(); 

        // Rellenar datos Autor
        document.getElementById('img-autor').src = datos.autor.foto || 'https://via.placeholder.com/250';
        document.getElementById('nombre-autor').innerText = datos.autor.nombre;
        document.getElementById('bio-autor').innerText = datos.autor.biografia || "Sin información.";

        // Rellenar Obras
        const contenedorObras = document.getElementById('lista-obras');
        contenedorObras.innerHTML = '';
        
        if (datos.obras.length === 0) {
            contenedorObras.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#777;">Sin obras registradas.</p>';
        } else {
            datos.obras.forEach(obra => {
                const imagenObra = (obra.imagenes && obra.imagenes.length > 0) ? obra.imagenes[0] : 'https://via.placeholder.com/200x150?text=Sin+Imagen';

                const card = document.createElement('div');
                card.className = 'card-obra-mini';
                card.innerHTML = `
                    <a href="ObrasDetalle.html?id=${obra._id}" style="text-decoration:none;">
                        <img src="${imagenObra}" alt="${obra.titulo}">
                        <div class="info-obra-mini">
                            <h4>${obra.titulo}</h4>
                            <span>${obra.anio} - ${obra.categoria}</span>
                        </div>
                    </a>
                `;
                contenedorObras.appendChild(card);
            });
        }

        // Mostrar
        document.getElementById('loading').style.display = 'none';
        document.getElementById('contenido-perfil').style.display = 'block';

    } catch (error) {
        console.error('Error RF-17:', error);
        document.getElementById('loading').innerText = "Error al cargar perfil.";
    }
}