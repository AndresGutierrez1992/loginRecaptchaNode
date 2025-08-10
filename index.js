require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// Configuración de EJS y middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de sesión (antes de las rutas)
app.use(session({ 
    secret: 'tu_secreto', // cámbialo por uno más seguro
    resave: false,    
    saveUninitialized: true,    
    cookie: { secure: false } // true si usas HTTPS
}));

// Rutas
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {  
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
