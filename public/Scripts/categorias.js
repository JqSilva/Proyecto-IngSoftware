document.addEventListener('DOMContentLoaded', cargarCategorias);

const formId = document.getElementById('cat-id');
const formNombre = document.getElementById('cat-nombre');
const formDesc = document.getElementById('cat-desc');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const alerta = document.getElementById('alerta-error');

// 1. CARGAR LISTADO
async function cargarCategorias() {
    try {
        const res = await fetch('/api/categorias');
        const lista = await res.json();
        
        const tbody = document.getElementById('lista-cats');
        tbody.innerHTML = '';

        lista.forEach(cat => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${cat.nombre}</strong></td>
                <td>${cat.descripcion || '-'}</td>
                <td style="text-align:right;">
                    <button class="btn-accion btn-editar" onclick="editar('${cat._id}', '${cat.nombre}', '${cat.descripcion}')">Editar</button>
                    <button class="btn-accion btn-borrar" onclick="borrar('${cat._id}', '${cat.nombre}')">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) { console.error(e); }
}

// 2. GUARDAR (CREAR O EDITAR)
btnGuardar.addEventListener('click', async () => {
    const id = formId.value;
    const datos = { nombre: formNombre.value, descripcion: formDesc.value };

    if(!datos.nombre) return alert("El nombre es obligatorio");

    const url = id ? `/api/categorias/${id}` : '/api/categorias';
    const metodo = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if(res.ok) {
            limpiarFormulario();
            cargarCategorias();
        }
    } catch (e) { console.error(e); }
});

// 3. PREPARAR EDICIÓN
window.editar = (id, nombre, desc) => {
    formId.value = id;
    formNombre.value = nombre;
    formDesc.value = desc === 'undefined' ? '' : desc;
    btnGuardar.innerText = "Actualizar";
    btnCancelar.style.display = 'block';
    alerta.style.display = 'none'; // Ocultar errores previos
};

// 4. ELIMINAR (CON VALIDACIÓN DE RESTRICCIÓN)
window.borrar = async (id, nombreCategoria) => {
    if(!confirm(`¿Seguro que deseas eliminar la categoría "${nombreCategoria}"?`)) return;

    try {
        // Importante: Enviamos el nombre en el body para validar la restricción en el backend
        const res = await fetch(`/api/categorias/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreCategoria: nombreCategoria })
        });

        const respuesta = await res.json();

        if (res.ok) {
            alerta.style.display = 'none';
            cargarCategorias();
        } else {
            // AQUÍ MOSTRAMOS EL ERROR DE RESTRICCIÓN (RF-8)
            alerta.innerText = respuesta.error;
            alerta.style.display = 'block';
        }
    } catch (e) { console.error(e); }
};

// UTILIDADES
btnCancelar.addEventListener('click', limpiarFormulario);

function limpiarFormulario() {
    formId.value = '';
    formNombre.value = '';
    formDesc.value = '';
    btnGuardar.innerText = "Guardar";
    btnCancelar.style.display = 'none';
    alerta.style.display = 'none';
}