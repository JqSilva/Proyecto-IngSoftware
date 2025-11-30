document.addEventListener('DOMContentLoaded', () => {
    // 1. Crear el botón automáticamente en la esquina
    const boton = document.createElement('button');
    boton.className = 'btn-tema';
    boton.innerText = '🌙'; // Luna por defecto
    boton.title = "Cambiar Modo Oscuro/Claro";
    document.body.appendChild(boton);

    // 2. Verificar si el usuario ya tenía modo oscuro guardado
    if (localStorage.getItem('tema') === 'oscuro') {
        document.body.classList.add('modo-oscuro');
        boton.innerText = '☀️'; // Cambiar a sol
    }

    // 3. Acción al hacer clic
    boton.addEventListener('click', () => {
        document.body.classList.toggle('modo-oscuro');

        // Guardar preferencia (RF-20 Restricción)
        if (document.body.classList.contains('modo-oscuro')) {
            localStorage.setItem('tema', 'oscuro');
            boton.innerText = '☀️';
        } else {
            localStorage.setItem('tema', 'claro');
            boton.innerText = '🌙';
        }
    });
});