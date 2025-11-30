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

        // --- 1. Rellenar Textos (Con protección contra 'undefined') ---
        document.getElementById('titulo-obra').innerText = obra.titulo || "Sin Título";
        
        const nombreAutor = (obra.autor && obra.autor.nombre) ? obra.autor.nombre : 'Autor Desconocido';
        document.getElementById('autor-obra').innerText = `Por ${nombreAutor}`;
        
        // Aquí corregimos el 'undefined': Buscamos descripción O description O un texto por defecto
        document.getElementById('desc-obra').innerText = obra.descripcion || obra.description || "No hay descripción disponible para esta obra.";
        
        // --- 2. Imagen Principal ---
        const imgElement = document.getElementById('img-principal');
        if (obra.imagenes && obra.imagenes.length > 0) {
            imgElement.src = obra.imagenes[0];
        } else {
            // Imagen por defecto si no hay ninguna
            imgElement.src = "https://via.placeholder.com/600x400?text=Sin+Imagen"; 
        }

        // --- 3. RF-19: Descargas ---
        const contenedorDescargas = document.getElementById('lista-descargas');
        contenedorDescargas.innerHTML = ''; 

        // TRUCO: Si no hay archivos reales, inventamos uno para probar el botón (RF-19)
        let archivos = [...(obra.documentos || []), ...(obra.adjuntos || [])];
        
        if (archivos.length === 0) {
            // Agregamos un archivo de prueba visual
            archivos.push({ nombre: "Ficha_Tecnica_Ejemplo.pdf", url: "#" });
        }

        archivos.forEach(archivo => {
            const item = document.createElement('div');
            item.className = 'linea-archivo';
            item.style.padding = "15px 0"; // Un poco más de aire
            
            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:1.5rem;">📄</span>
                    <span class="nombre-archivo">${archivo.nombre || 'Documento disponible'}</span>
                </div>
                <a href="${archivo.url}" target="_blank" class="boton-descargar" download>
                    Descargar
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </a>
            `;
            contenedorDescargas.appendChild(item);
        });

    } catch (error) {
        console.error(error);
        document.querySelector('.tarjeta-detalle').innerHTML = '<h2 style="text-align:center; color:#c0392b;">Error cargando la información.</h2>';
    }
}