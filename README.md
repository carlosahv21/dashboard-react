# 📊 Custom Dashboard

Este proyecto es un panel de administración moderno construido con React, diseñado para gestionar datos visuales, calendarios y reportes.

## 🚀 Stack Tecnológico

- ⚛️ **Core:** React 18
- 🎨 **UI:** Ant Design & MDB React UI Kit
- 📈 **Gráficos:** Apache ECharts
- 📅 **Calendario:** FullCalendar
- 🛣️ **Enrutamiento:** React Router 6

## 🛠️ Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (v16 o superior)
- [pnpm](https://pnpm.io/) (Recomendado para gestión de paquetes)

## 🏁 Guía de Inicio Rápido

Sigue estos pasos para ejecutar el proyecto localmente:

### 1. Clonar el repositorio

```bash
git clone https://github.com/carlosahv21/dashboard-react.git
cd dashboard-react
```

### 2. Instalar dependencias

```bash
pnpm install
# O si usas npm:
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto. **Nota:** El archivo `.env` no se sube al repositorio por seguridad.

```env
# Ejemplo de configuración
REACT_APP_BASE_URL="http://localhost:3000"
REACT_APP_BACKEND_URL="http://api.tu-backend.com"
```

### 4. Ejecutar servidor de desarrollo

```bash
pnpm run dev
```

El proyecto estará disponible en [http://localhost:3000](http://localhost:3000).

## 📜 Scripts Disponibles

| Comando          | Descripción                                                   |
| :--------------- | :------------------------------------------------------------ |
| `pnpm run dev`   | Inicia el entorno de desarrollo local (React Scripts).        |
| `pnpm run build` | Compila la aplicación para producción en la carpeta `/build`. |
| `pnpm test`      | Ejecuta las pruebas unitarias.                                |

## 📂 Estructura del Proyecto

```text
src/
├── assets/      # Imágenes y recursos estáticos
├── components/  # Componentes reutilizables (Botones, Gráficos, Inputs)
├── context/     # Estados globales (Context API)
├── hooks/       # Custom Hooks para lógica reutilizable
├── reports/     # Lógica para generación de Excel/PDF
├── views/       # Páginas principales (Vistas)
└── index.js     # Punto de entrada de la aplicación
```

---

💡 **Tip:** Asegúrate de no subir archivos sensibles o carpetas de build al repositorio. Revisa el `.gitignore` si tienes dudas.
