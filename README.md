# 🎨 Plataforma de Gestión de Obras y Autores (Grupo 2)

Este repositorio contiene el Backend base (Node.js + Express + MongoDB) y los módulos de visualización listos.

---

## 🚀 Instrucciones para el Grupo

1.  **Clonar y Entrar:**
    ```bash
    git clone <URL_DEL_REPO>
    cd Proyecto-IngSoftware
    ```

2.  **Instalar Librerías:**
    (Importante: El proyecto NO incluye node_modules, deben generarlo así)
    ```bash
    npm install
    ```

3.  **Iniciar Servidor:**
    ```bash
    node server.js
    ```
    Visitar: `http://localhost:3000/Autores.html`

---

## ⚠️ Reglas de Base de Datos (¡LEER!)

Para que sus formularios (RF-1, RF-3) funcionen con mis listados, deben usar estos nombres EXACTOS en sus modelos de Mongoose:

### 1. Autores (Schema)
* `nombre`: String (Obligatorio)
* `biografia`: String
* `foto`: String (URL o ruta local)

### 2. Obras (Schema)
* `titulo`: String
* `anio`: Number
* `categoria`: String
* `descripcion`: String
* `autor`: ObjectId (Referencia al autor)
* `imagenes`: [String] (Array de URLs)
* `documentos`: [{ nombre: String, url: String }]