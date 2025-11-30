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

// --- CONEXIÓN BASE DE DATOS (Mongo Atlas o Local) ---
// 1. Aquí pegas tu "Connection String" de Atlas
const uri = "mongodb+srv://Lalokura:LalokuraAdmin@cluster0.wfhln62.mongodb.net/?appName=Cluster0";

// 2. Aquí le decimos a Mongoose que use esa variable 'uri'
mongoose.connect(uri,{
    dbName: 'galeria_arte'
    }
)
    .then(() => console.log('✅ Conectado a MongoDB Atlas (Nube)'))
    .catch(err => console.error('❌ Error de conexión:', err));
// --- MODELOS (Base de datos) ---

// Modelo para RF-16 y RF-17 (Autores)
const AutorSchema = new mongoose.Schema({
    nombre: String,
    biografia: String, // RF-17: Biografía
    foto: String,      // RF-16: Fotografía
    enlaces: [String]
});
const Autor = mongoose.model('Autor', AutorSchema);

// Modelo para RF-18 y RF-19 (Obras)
const ObraSchema = new mongoose.Schema({
    titulo: String,
    anio: Number,
    categoria: String,
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Autor' },
    etiquetas: [String], // RF-18: Búsqueda por etiquetas
    archivos: [{ nombre: String, url: String }] // RF-19: Descargas
});
const Obra = mongoose.model('Obra', ObraSchema);

// --- RUTAS (API) ---

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


