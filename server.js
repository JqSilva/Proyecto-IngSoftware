// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
// Servir tus archivos HTML/CSS estáticos
app.use(express.static('public'));

/* --- CONEXIÓN BASE DE DATOS (Mongo Atlas o Local) ---
// 1. Aquí pegas tu "Connection String" de Atlas
const uri = "mongodb+srv://Lalokura:LalokuraAdmin@cluster0.wfhln62.mongodb.net/?appName=Cluster0";

// 2. Aquí le decimos a Mongoose que use esa variable 'uri'
mongoose.connect(uri,{
    dbName: 'galeria_arte'
    }
)
    .then(() => console.log('✅ Conectado a MongoDB Atlas (Nube)'))
    .catch(err => console.error('❌ Error de conexión:', err));
*/
console.log('⚠️ MODO OFFLINE: Usando datos simulados (Mock) para pruebas sin Atlas.');


// --- MODELOS (Base de datos) ---

// Modelo para RF-16 y RF-17 (Autores)
const AutorSchema = new mongoose.Schema({
    nombre: String,
    biografia: String, // RF-17: Biografía
    foto: String,      // RF-16: Fotografía
    enlaces: [String]
});
const Autor = mongoose.model('Autor', AutorSchema);

// Modelo para Obras
const ObraSchema = new mongoose.Schema({
    titulo: String,
    anio: Number,
    categoria: String,
    descripcion: String, 
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Autor' },

    // --- CAMPOS NUEVOS PARA RF-7  ---
    imagenes: [String],  // Array de URLs para la galería
    video: String,       // URL del video (YouTube embed)


    etiquetas: [String], // RF-18: Búsqueda por etiquetas
    documentos: [{ nombre: String, url: String }] // RF-19: Descargas
});
const Obra = mongoose.model('Obra', ObraSchema);

// Modelo Categoria PARA RF-8 
const CategoriaSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    descripcion: String
});
const Categoria = mongoose.model('Categoria', CategoriaSchema);

// --- RUTAS (API) ---


// NUEVA RUTA RF-6: Paginación (Híbrido)

// MODO_OFFLINE: true = Datos falsos (para probar sin BD). false = Datos reales de Mongo.
const MODO_OFFLINE = true; 

app.get('/api/obras-paginadas', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    try {
        let obrasResponse = [];
        let totalObras = 0;

        if (MODO_OFFLINE) {
            // --- MODO SIN CONEXIÓN (Simulación) ---
            console.log("⚠️ Usando datos simulados (Mock)...");
            
            // Generamos 50 obras falsas al vuelo
            const obrasFalsas = Array.from({ length: 50 }, (_, i) => ({
                _id: `mock_id_${i}`,
                titulo: `Obra Simulada N° ${i + 1}`,
                anio: 2020 + (i % 5),
                categoria: (i % 2 === 0) ? "Pintura" : "Escultura",
                descripcion: "Descripción generada para pruebas sin Base de Datos.",
                autor: { nombre: `Artista Bot ${i}`, _id: 'mock_autor_id' }, 
                imagenes: ["/Style/Imagenes/RegistroObra.jpg"],
                etiquetas: ["simulado"]
            }));

            // Simulamos la paginación cortando el array
            totalObras = 50;
            obrasResponse = obrasFalsas.slice(skip, skip + limit);

        } else {
            // --- MODO CONECTADO (Mongo Atlas) ---
            // Esto se ejecuta cuando MODO_OFFLINE = false
            totalObras = await Obra.countDocuments();
            obrasResponse = await Obra.find()
                .populate('autor')
                .skip(skip)
                .limit(limit);
        }

        // Respuesta unificada para el Frontend
        res.json({
            data: obrasResponse,
            total: totalObras,
            page: page,
            pages: Math.ceil(totalObras / limit)
        });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// RUTA RF-7: Detalle de Obra (Híbrida)

app.get('/api/obras/:id', async (req, res) => {
    try {
        if (MODO_OFFLINE) {
            // --- MODO SIMULADO (RF-7) ---
            const id = req.params.id;
            
            // Creamos un objeto "rico" para demostrar el RF-7
            const obraSimulada = {
                _id: id,
                titulo: `Detalle Completo de Obra (${id})`,
                anio: 2024,
                categoria: "Arte Digital Multimedia",
                descripcion: "Esta es una descripción extendida para cumplir con el RF-7. La obra representa la intersección entre la tecnología y el arte clásico, demostrando cómo los medios digitales pueden evocar emociones tradicionales.",
                autor: { 
                    nombre: "Artista Visual Pro", 
                    biografia: "Experto en instalaciones multimedia." 
                },
                // GALERÍA (RF-7): Varias imágenes
                imagenes: [
                    "https://via.placeholder.com/800x400?text=Vista+Principal",
                    "https://via.placeholder.com/800x400/2c3e50/ffffff?text=Detalle+Lateral",
                    "https://via.placeholder.com/800x400/4a7c59/ffffff?text=Boceto+Inicial"
                ],
                // MULTIMEDIA (RF-7): Video de YouTube simulado
                video: "https://www.youtube.com/embed/dQw4w9WgXcQ", 
                // ARCHIVOS (RF-7): Documentos
                documentos: [
                    { nombre: "Ficha_Tecnica.pdf", url: "#" },
                    { nombre: "Certificado_Autenticidad.docx", url: "#" }
                ]
            };
            return res.json(obraSimulada);

        } else {
            // --- MODO REAL (Mongo Atlas) ---
            const obra = await Obra.findById(req.params.id).populate('autor');
            if (!obra) return res.status(404).json({ error: 'Obra no encontrada' });
            res.json(obra);
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// RUTAS RF-8: GESTIÓN DE CATEGORÍAS

// 1. LISTAR (GET)
app.get('/api/categorias', async (req, res) => {
    try {
        if (MODO_OFFLINE) {
            // Mock de Categorías
            const cats = [
                { _id: "c1", nombre: "Pintura", descripcion: "Obras realizadas con pigmentos." },
                { _id: "c2", nombre: "Escultura", descripcion: "Arte tridimensional." },
                { _id: "c3", nombre: "Digital", descripcion: "Arte creado por ordenador." }
            ];
            return res.json(cats);
        }
        const categorias = await Categoria.find();
        res.json(categorias);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. CREAR (POST)
app.post('/api/categorias', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        
        if (MODO_OFFLINE) {
            return res.json({ _id: "new_mock_" + Date.now(), nombre, descripcion });
        }
        
        const nueva = new Categoria({ nombre, descripcion });
        await nueva.save();
        res.json(nueva);
    } catch (e) { res.status(500).json({ error: "Error al crear: " + e.message }); }
});

// 3. EDITAR (PUT)
app.put('/api/categorias/:id', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        if (MODO_OFFLINE) {
            return res.json({ _id: req.params.id, nombre, descripcion });
        }
        await Categoria.findByIdAndUpdate(req.params.id, { nombre, descripcion });
        res.json({ message: "Actualizado" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. ELIMINAR con RESTRICCIÓN (DELETE)
app.delete('/api/categorias/:id', async (req, res) => {
    try {
        const { nombreCategoria } = req.body; 
        
        //  VALIDACIÓN DE RESTRICCIÓN 
        let obrasUsandoCategoria = 0;

        if (MODO_OFFLINE) {
            // Simulamos que "Pintura" siempre está usada para probar el error
            if (nombreCategoria === "Pintura") obrasUsandoCategoria = 5; 
        } else {
            // Buscamos en la colección real de Obras
            obrasUsandoCategoria = await Obra.countDocuments({ categoria: nombreCategoria });
        }

        if (obrasUsandoCategoria > 0) {
            return res.status(400).json({ 
                error: `⚠️ RESTRICCIÓN: No se puede eliminar '${nombreCategoria}' porque hay ${obrasUsandoCategoria} obras usándola.` 
            });
        }

        // Si pasa la validación, borramos
        if (!MODO_OFFLINE) {
            await Categoria.findByIdAndDelete(req.params.id);
        }
        
        res.json({ message: "Categoría eliminada correctamente." });

    } catch (e) { res.status(500).json({ error: e.message }); }
});


// RUTA RF-9-10: REGISTRAR OBRA (Con validación)

app.post('/api/obras', async (req, res) => {
    try {
        const { titulo, categoria, descripcion, autor, anio, etiquetas } = req.body;

        // VALIDACIÓN DE RESTRICCIÓN (RF-9)
        if (!categoria) {
            return res.status(400).json({ error: "❌ La categoría es obligatoria." });
        }

        let existeCategoria = false;

        if (MODO_OFFLINE) {
            // Mock: Validamos contra una lista quemada (simulando la DB)
            const categoriasValidas = ["Pintura", "Escultura", "Digital", "Fotografía"]; 
            existeCategoria = categoriasValidas.includes(categoria);
        } else {
            // Real: Buscamos en la colección de Categorías de Mongo
            const catEncontrada = await Categoria.findOne({ nombre: categoria });
            existeCategoria = !!catEncontrada;
        }

        if (!existeCategoria) {
            return res.status(400).json({ 
                error: `❌ RESTRICCIÓN RF-9: La categoría '${categoria}' no es válida o no existe en el sistema.` 
            });
        }

        // Si pasa la validación, guardamos
        if (MODO_OFFLINE) {
            console.log("Simulando guardado con tags:", etiquetas);
            res.json({ 
                message: "Obra registrada correctamente (Simulado)", 
                _id: "new_id_123",
                titulo,
                categoria,
                etiquetas 
            });
        } else {
            const nuevaObra = new Obra({ 
                titulo, categoria, descripcion, autor, anio, etiquetas 
            });
            await nuevaObra.save();
            res.json(nuevaObra);
        }

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// 1. API para RF-16 (Listado de Autores)
app.get('/api/autores', async (req, res) => {
    try {
        const autores = await Autor.find().limit(20); 
        res.json(autores);
    } catch (e) { res.status(500).json({error: e.message}); }
});

// 2. API para RF-17 (Perfil de un solo Autor)
app.get('/api/autores/:id', async (req, res) => {
    try {
        const autor = await Autor.findById(req.params.id);
        if (!autor) return res.status(404).json({ error: 'Autor no encontrado' });

        // Buscamos las obras de este autor
        const obras = await Obra.find({ autor: autor._id });
        
        // Devolvemos todo junto
        res.json({ autor, obras }); 
    } catch (e) { 
        console.error(e);
        res.status(500).json({error: e.message}); 
    }
});

// 2. API para RF-17 (Perfil de Autor + Obras)
app.get('/api/autores/:id', async (req, res) => {
    try {
        const autor = await Autor.findById(req.params.id);
        const obras = await Obra.find({ autor: autor._id });
        [cite_start]// Devolvemos autor y sus obras relacionadas [cite: 347]
        res.json({ autor, obras }); 
    } catch (e) { res.status(500).json({error: e.message}); }
});

// 3. API para RF-18 (Búsqueda)
app.get('/api/obras/buscar', async (req, res) => {
    try {
        const { query } = req.query; // Lo que escribe el usuario
        [cite_start]// Busca por Título O Categoría O Etiqueta [cite: 365]
        const obras = await Obra.find({
            $or: [
                { titulo: { $regex: query, $options: 'i' } },
                { categoria: { $regex: query, $options: 'i' } },
                { etiquetas: { $in: [new RegExp(query, 'i')] } }
            ]
        }).populate('autor');
        res.json(obras);
    } catch (e) { res.status(500).json({error: e.message}); }
});

// RUTA DE REPARACIÓN DE DATOS
app.get('/crear-datos-prueba', async (req, res) => {
    try {
        await Autor.deleteMany({}); // Borra lo anterior para no duplicar
        await Obra.deleteMany({});

        const autor = await new Autor({
            nombre: "Pablo Neruda",
            biografia: "Ricardo Eliécer Neftalí Reyes Basoalto, conocido como Pablo Neruda, fue un poeta y político chileno.",
            foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Pablo_Neruda_1963.jpg/220px-Pablo_Neruda_1963.jpg"
        }).save();

        const obra = await new Obra({
            titulo: "Veinte poemas de amor",
            anio: 1924,
            categoria: "Poesía",
            descripcion: "Es una de las obras literarias de mayor renombre del siglo XX en lengua española.", // Aquí está el campo correcto
            autor: autor._id,
            imagenes: ["https://images.cdn3.buscalibre.com/fit-in/360x360/68/73/68735239537604646731969018693890.jpg"],
            documentos: [{ nombre: "Analisis_Literario.pdf", url: "https://www.google.com" }] // Un archivo de prueba
        }).save();

        res.send("<h1>✅ Datos reparados. Vuelve a la página de Obras.</h1>");
    } catch (e) { res.send(e.message); }
});

// 3. API para RF-18 (Búsqueda de Obras y Listado)
app.get('/api/obras', async (req, res) => {
    try {
        const { busqueda } = req.query;
        let filtro = {};

        // Si el usuario escribió algo, filtramos
        if (busqueda) {
            filtro = {
                $or: [
                    { titulo: { $regex: busqueda, $options: 'i' } }, // i = ignora mayúsculas
                    { categoria: { $regex: busqueda, $options: 'i' } },
                    { etiquetas: { $in: [new RegExp(busqueda, 'i')] } }
                ]
            };
        }

        // Buscamos y usamos .populate('autor') para traer los datos del autor asociado
        const obras = await Obra.find(filtro).populate('autor');
        res.json(obras);
    } catch (e) { 
        res.status(500).json({error: e.message}); 
    }
});

// 4. API para RF-19 (Detalle de una Obra y Descargas)
app.get('/api/obras/:id', async (req, res) => {
    try {
        // Buscamos la obra por ID y traemos los datos del autor
        const obra = await Obra.findById(req.params.id).populate('autor');
        
        if (!obra) {
            return res.status(404).json({ error: 'Obra no encontrada' });
        }
        res.json(obra);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// Iniciar servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});


