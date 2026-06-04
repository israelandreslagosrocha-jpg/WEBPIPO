# Tinta Conectada - Buscador de Tatuadores en La Araucanía

Este es un prototipo interactivo de alta fidelidad para la plataforma **Tinta Conectada**. Está diseñado como una Single Page Application (SPA) responsiva y moderna utilizando tecnologías web nativas (HTML5, CSS3 y JavaScript Vanilla), respetando cada sección y estilo de las referencias visuales proporcionadas.

---

## 🎨 Características Implementadas

### 1. Vista de Búsqueda y Exploración (Home)
* **Cabecera (Header):** Logo personalizado, navegación fluida, botón de registro de artistas y conmutadores rápidos de filtros.
* **Filtros de Búsqueda Avanzados (Sidebar):**
  * Ubicación (Dropdown con soporte regional).
  * Estilos de tatuaje (Botones dinámicos con micro-animaciones).
  * Experiencia (Rango de años).
  * Precio referencial (Nivel de precios con tooltip informativo).
  * Disponibilidad semanal/mensual.
  * Botones de acción "Aplicar" y "Limpiar".
* **Banner Hero:** Título destacado, caja de búsqueda interactiva e ilustración de fondo de alta calidad en arte lineal morado (ave y rostro femenino) que coincide con la estética del mockup.
* **Carrusel de Categorías:** Fila superior deslizable horizontalmente para seleccionar estilos y filtrar las tarjetas en tiempo real.
* **Mapa de Ubicación Interactivo:** Mapa integrado usando Leaflet.js centrado en la región de La Araucanía con marcadores personalizados (Temuco, Padre Las Casas, Villarrica) que vinculan la ubicación del artista al portafolio. Cuenta con botón de expansión fluida de 160px a 400px.
* **Cuadrícula de Tatuadores Destacados:** Tarjetas de perfil completas con portafolio, tags, ubicación, experiencia, precio referencial, animación de "favorito" (corazón pulsante) y notificaciones toast integradas.

### 2. Vista de Perfil de Tatuador (Studio Tatto Pipo)
Al presionar la tarjeta de **Studio Tatto Pipo**, el sitio transiciona suavemente a la vista de perfil detallado:
* **Tarjeta Lateral del Artista:** Muestra el logo circular con cráneo, ubicación en *Teodoro Schmidt*, botón con enlace de Instagram y sección informativa "Hacerca de" (respetando la ortografía de la referencia visual).
* **Carrusel 3D Interactivo:** Galería central en profundidad 3D que resalta la imagen activa y aplica desenfoque y escala a las imágenes secundarias. Soporta controles mediante botones y gestos táctiles/arrastre (swipe).
* **Galería Tabulada de Trabajos:** Pestañas de categorías (*Tatuajes, Brazo, Manos, Torso, Piernas*) que filtran dinámicamente la cuadrícula inferior.
* **Lightbox de Zoom:** Al hacer clic en cualquier imagen de la galería, se abre una ventana modal con fondo desenfocado para apreciar los detalles del tatuaje.

### 3. Paneles Flotantes y Drawer de Información
* **Drawer "Filtrar Artistas" (Color Morado):** Deslizable desde la derecha. Contiene un control de slider de distancia máxima ("Sin límite") y selectores conmutadores (toggles) interactivos de estilos como *Puntillismo, Blackwork, Realismo, Black & Grey, Acuarela y Fine Line*, cada uno con su correspondiente icono estilizado según la captura.
* **Drawer "Información de Tatuador" (Color Morado):** Muestra de forma interactiva la biografía, años de experiencia y marcas de tintas veganas premium utilizadas por el artista (Dynamic Ink, Eternal Ink, Solid Ink).

---

## 🛠️ Tecnologías Utilizadas

1. **HTML5 Semántico:** Estructura limpia y accesible.
2. **Vanilla CSS3:** Variables de diseño, HSL para colores armonizados, flexbox/grid para layouts y media queries para responsive móvil y tablet.
3. **Vanilla JavaScript:** Control de navegación de la SPA, carrusel 3D, filtros dinámicos en tiempo real de tarjetas y marcadores de mapa.
4. **Leaflet.js:** Librería de mapas interactivos de alto rendimiento, configurada con tiles ligeros de CartoDB Positron.
5. **Lucide Icons:** Conjunto de iconos vectoriales modernos y minimalistas.
6. **Google Fonts (Outfit):** Tipografía geométrica y redondeada de aspecto premium.

---

## 🚀 Cómo Ejecutar el Proyecto

No requiere compilación ni dependencias complejas. Solo clona el proyecto y ábrelo en tu navegador favorito:

1. **Localmente:**
   * Haz doble clic en el archivo `index.html` para abrirlo directamente en el navegador.
   * O ejecuta un servidor local rápido en la terminal dentro de esta carpeta:
     ```sh
     npx serve
     ```
     O abre el archivo con la extensión **Live Server** de VS Code para una recarga automática al editar.
