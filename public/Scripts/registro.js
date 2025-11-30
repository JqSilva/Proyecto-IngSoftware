let etiquetasAcumuladas = []; // Aquí guardaremos los tags temporalmente

document.addEventListener('DOMContentLoaded', () => {
    cargarCategoriasSelect(); // RF-9
    iniciarGestorEtiquetas(); // RF-10
    
    const formulario = document.querySelector('.formulario');
    if(formulario) {
        formulario.addEventListener('submit', registrarObra);
    }
});

// --- LÓGICA RF-10: GESTOR DE ETIQUETAS ---
function iniciarGestorEtiquetas() {
    const inputTag = document.querySelector('.input-tag');
    const contenedor = document.querySelector('.contenedor-tags');

    if (!inputTag || !contenedor) return;

    // Escuchar la tecla ENTER en el input de tags
    inputTag.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evitar que el formulario se envíe solo
            const texto = inputTag.value.trim();
            
            if (texto && !etiquetasAcumuladas.includes(texto)) {
                agregarTagVisual(texto, contenedor);
                etiquetasAcumuladas.push(texto);
                inputTag.value = ''; // Limpiar input
            }
        }
    });
}

function agregarTagVisual(texto, contenedor) {
    // Crear el elemento visual (Chip)
    const tagSpan = document.createElement('span');
    tagSpan.className = 'tag-chip'; // Necesitaremos estilo CSS para esto
    tagSpan.style.cssText = "background:#e0e0e0; padding:5px 10px; border-radius:15px; margin-right:5px; display:inline-flex; align-items:center; gap:5px; font-size:0.9rem;";
    
    tagSpan.innerHTML = `
        ${texto} 
        <span style="cursor:pointer; font-weight:bold; color:#c0392b;" class="btn-borrar-tag">×</span>
    `;

    // Borrar tag al hacer clic en la X
    tagSpan.querySelector('.btn-borrar-tag').addEventListener('click', () => {
        etiquetasAcumuladas = etiquetasAcumuladas.filter(t => t !== texto);
        tagSpan.remove();
    });

    // Insertar antes del input (para que el input quede al final)
    const input = document.querySelector('.input-tag');
    contenedor.insertBefore(tagSpan, input);
}

// --- RF-9: CARGA DE CATEGORÍAS (Se mantiene igual) ---
async function cargarCategoriasSelect() {
    const select = document.getElementById('categoria');
    if (!select) return;
    try {
        const res = await fetch('/api/categorias');
        const categorias = await res.json();
        select.innerHTML = '<option value="" disabled selected>Seleccione una categoría...</option>';
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.nombre;
            option.textContent = cat.nombre;
            select.appendChild(option);
        });
    } catch (error) { console.error("Error cats:", error); }
}

// --- GUARDADO FINAL (RF-9 + RF-10) ---
async function registrarObra(e) {
    e.preventDefault();

    const datos = {
        titulo: document.getElementById('titulo').value,
        categoria: document.getElementById('categoria').value,
        descripcion: document.getElementById('descripcion').value,
        anio: document.getElementById('anio').value,
        etiquetas: etiquetasAcumuladas // <--- ¡AQUÍ ENVIAMOS LAS ETIQUETAS! (RF-10)
    };

    try {
        const res = await fetch('/api/obras', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const respuesta = await res.json();

        if (res.ok) {
            alert("✅ Obra registrada con etiquetas.");
            window.location.href = "Obras.html";
        } else {
            alert(respuesta.error);
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión");
    }
}