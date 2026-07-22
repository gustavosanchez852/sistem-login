# Sistema Login

Aplicación web full-stack con autenticación de usuarios, gestión de artículos (inventario), subida/descarga de archivos y procesamiento de pagos con control de stock.

## Stack

**Cliente** — React 19 + React Router 7, Axios para las llamadas a la API.

**Servidor** — Node.js + Express 5, PostgreSQL (vía `pg`), autenticación con JWT y `bcrypt`, subida de archivos con `multer`, envío de correos con `nodemailer`.

## Estructura del proyecto

```
sistema-login/
├── client/                  # Frontend en React
│   └── src/
│       ├── components/      # Páginas: Login, Registro, Dashboard, Artículos, Archivos, Pagos...
│       └── App.js           # Definición de rutas
└── server/                  # Backend en Express
    ├── controllers/         # Lógica de negocio (auth, artículos, archivos, pagos)
    ├── routes/               # Definición de endpoints
    ├── uploads/              # Carpeta donde se guardan los archivos subidos
    ├── db.js                 # Conexión a PostgreSQL
    └── server.js             # Punto de entrada del servidor
```

## Funcionalidad

- **Autenticación**: registro, login (con usuario o email), recuperación y restablecimiento de contraseña por correo. Las contraseñas se validan con requisitos mínimos (mayúscula, minúscula, número y símbolo, 8+ caracteres) y se guardan con hash `bcrypt`. El login devuelve un JWT válido por 1 hora.
- **Artículos**: CRUD completo de artículos con nombre, precio, cantidad e imagen.
- **Archivos**: subida, listado, descarga y eliminación de archivos, almacenados en `server/uploads/`.
- **Pagos**: registra una venta y descuenta el stock del artículo correspondiente dentro de una transacción atómica (si algo falla, se revierte todo).

## Requisitos previos

- Node.js
- PostgreSQL, con una base de datos creada y las tablas `users`, `articulos` y `pagos` (revisa las consultas en `server/controllers/` para ver las columnas exactas que espera cada una).

## Instalación

### Backend

```bash
cd server
npm install
```

Crea un archivo `.env` dentro de `server/` con estas variables (usa tus propios valores, no los del repositorio):

```
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=authdb
DB_PASSWORD=tu_contraseña
DB_PORT=5432
PORT=5000
JWT_SECRET=una_clave_larga_y_aleatoria
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicación
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

Arranca el servidor:

```bash
node server.js
```

### Frontend

```bash
cd client
npm install
```

Crea un archivo `.env` dentro de `client/` con la URL de tu backend:

```
REACT_APP_API_URL=http://localhost:5000
```

Arranca el cliente:

```bash
npm start
```

## Notas y pendientes

- **`server.js` vs `authroutes.js`**: `server.js` importa `./routes/authRoutes`, pero el archivo en disco se llama `authroutes.js` (todo en minúscula). En sistemas de archivos sensibles a mayúsculas (Linux, y por tanto la mayoría de los servidores en producción) esto hace que el `require` falle. Renombra el archivo a `authRoutes.js` o corrige el import.
- **Rutas sin proteger**: en `client/src/App.js`, solo `/dashboard` está envuelta en `PrivateRoute`. Las rutas `/articulos`, `/archivos` y `/pagos` son accesibles sin sesión iniciada desde el cliente (y sus endpoints en el servidor tampoco validan el JWT). Si estas secciones deben requerir autenticación, hace falta añadir la protección tanto en el frontend como en el backend.
- **`server2.js` y `ejemplo.js`**: son versiones anteriores/de prueba del servidor (con la contraseña de la base de datos escrita directamente en el código). No se usan en el arranque normal del proyecto; puedes eliminarlos o dejarlos fuera del control de versiones si no aportan nada más.
- El token de sesión se guarda en `localStorage` del navegador.
