document.addEventListener('DOMContentLoaded', cargarDetalleObra);

async function cargarDetalleObra() {
    const params = new URLSearchParams(window.location.search);
    const idObra = params.get('id');

    if (!idObra) {
        window.location.href = 'Obras.html';
        return;
    }

    try {
        const respuesta = await fetch(`/api/obras/${idObra}`);
        if (!respuesta.ok) throw new Error('Error al cargar la obra');
        const obra = await respuesta.json();

        // 1. Textos Básicos
        document.getElementById('titulo-obra').innerText = obra.titulo || "Sin Título";
        const nombreAutor = (obra.autor && obra.autor.nombre) ? obra.autor.nombre : 'Autor Desconocido';
        document.getElementById('autor-obra').innerText = `Por ${nombreAutor}`;
        document.getElementById('desc-obra').innerText = obra.descripcion || "No hay descripción disponible.";

        // 2. Imagen Principal
        const imgPrincipal = document.getElementById('img-principal');
        const imagenes = obra.imagenes || [];
        
        if (imagenes.length > 0) {
            imgPrincipal.src = imagenes[0]; // Poner la primera por defecto
        } else {
            imgPrincipal.src = "https://via.placeholder.com/600x400?text=Sin+Imagen";
        }

        // 3. GALERÍA (RF-7)
        const contenedorGaleria = document.getElementById('galeria-miniaturas');
        if (imagenes.length > 1) {
            contenedorGaleria.style.display = 'flex';
            contenedorGaleria.innerHTML = ''; // Limpiar

            imagenes.forEach(urlImg => {
                const thumb = document.createElement('img');
                thumb.src = urlImg;
                thumb.className = 'thumb-img';
                
                // Evento: Al hacer clic, cambiar la principal
                thumb.addEventListener('click', () => {
                    imgPrincipal.src = urlImg;
                });
                
                contenedorGaleria.appendChild(thumb);
            });
        }

        // 4. MULTIMEDIA / VIDEO (RF-7)
        const divVideo = document.getElementById('contenedor-video');
        const iframe = document.getElementById('frame-video');

        if (obra.video) {
            divVideo.style.display = 'block';
            iframe.src = obra.video;
        }

        // 5. ARCHIVOS (RF-7)
        const contenedorDescargas = document.getElementById('lista-descargas');
        contenedorDescargas.innerHTML = ''; 
        
        // Unificar adjuntos si vienen de diferentes campos
        let archivos = [...(obra.documentos || [])];

        if (archivos.length === 0) {
            contenedorDescargas.innerHTML = '<p class="texto-sin-archivos">No hay archivos adjuntos.</p>';
        } else {
            archivos.forEach(archivo => {
                const item = document.createElement('div');
                item.className = 'linea-archivo';
                item.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:1.5rem;">📄</span>
                        <span class="nombre-archivo">${archivo.nombre || 'Archivo'}</span>
                    </div>
                    <a href="${archivo.url}" target="_blank" class="boton-descargar" download>
                        Descargar
                    </a>
                `;
                contenedorDescargas.appendChild(item);
            });
        }

    } catch (error) {
        console.error(error);
        document.querySelector('.tarjeta-detalle').innerHTML = '<h2 style="text-align:center; color:#c0392b;">Error cargando la información.</h2>';
    }
}