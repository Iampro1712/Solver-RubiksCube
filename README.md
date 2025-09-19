# 🔥 Rubik's Cube Solver - WebApp Espectacular

Una webapp increíble para resolver cubos de Rubik con visualización 3D interactiva, algoritmos avanzados y diseño espectacular.

![Rubik's Cube Solver](https://img.shields.io/badge/Status-Completed-success)
![Made with Three.js](https://img.shields.io/badge/Made%20with-Three.js-blue)
![Responsive](https://img.shields.io/badge/Design-Responsive-green)
![Interactive](https://img.shields.io/badge/Features-Interactive-orange)

## ✨ Características Principales

### 🎯 **Cubo 3D Interactivo**
- **Visualización 3D realista** con Three.js
- **Controles intuitivos** de mouse y táctiles
- **Animaciones fluidas** y suaves
- **Detección de clics** en las caras del cubo
- **Rotación automática** cuando no hay interacción

### 🧠 **Algoritmo de Resolución Inteligente**
- **Método CFOP simplificado** (Cross, F2L, OLL, PLL)
- **Pasos detallados** con explicaciones visuales
- **Optimización automática** de movimientos
- **Ejecución paso a paso** o automática
- **Estadísticas completas** de la solución

### 🎨 **Interfaz Espectacular**
- **Diseño moderno** con efectos glassmorphism
- **Gradientes dinámicos** y animaciones fluidas
- **100% responsive** para todos los dispositivos
- **Tema oscuro/claro** automático
- **Partículas de fondo** animadas

### 🎮 **Funciones Interactivas**
- **Mezclado aleatorio** personalizable
- **Entrada manual de colores** con editor visual
- **Historial de soluciones** completo
- **Temporizador preciso** y estadísticas
- **Tutorial interactivo** paso a paso

### 📱 **Optimización Móvil**
- **Controles táctiles** avanzados
- **Gestos de swipe** para movimientos rápidos
- **Feedback háptico** en dispositivos compatibles
- **Diseño adaptativo** para landscape/portrait
- **Rendimiento optimizado** para móviles

### 🔊 **Efectos Audiovisuales**
- **Sonidos dinámicos** para cada movimiento
- **Efectos de partículas** al resolver
- **Fuegos artificiales** de celebración
- **Animaciones de carga** suaves
- **Notificaciones elegantes**

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 16+ y npm

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/Solver-RubiksCube.git
cd Solver-RubiksCube

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de la build
npm run preview
```

### 🌐 Acceso Directo
La aplicación se abrirá automáticamente en: `http://localhost:3000`

## 🎯 Cómo Usar la Aplicación

### 🎲 **Mezclar el Cubo**
1. Haz clic en **"Mezclar"** para generar una configuración aleatoria
2. O usa la **entrada manual** para crear tu propio patrón
3. El timer se iniciará automáticamente con tu primer movimiento

### 🔧 **Resolver el Cubo**
1. Presiona **"¡Resolver!"** para calcular la solución
2. Ve los **pasos detallados** en el panel lateral
3. Ejecuta la **solución automática** o manual
4. ¡Disfruta de la **celebración** cuando termine!

### 📚 **Aprender con Tutoriales**
1. Ve a la sección **"Tutorial"**
2. Elige entre **Principiante**, **CFOP** o **Avanzado**
3. Sigue las **instrucciones paso a paso**
4. Practica con **algoritmos interactivos**

### ⚙️ **Personalizar Configuración**
- Ajusta la **velocidad de animación**
- Activa/desactiva **sonidos y efectos**
- Cambia entre **tema claro/oscuro**
- Configura **controles específicos**

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Vite** - Build tool ultra-rápido
- **Three.js** - Visualización 3D
- **Tween.js** - Animaciones suaves
- **Vanilla JavaScript** - Lógica de aplicación
- **CSS3** - Estilos avanzados y responsive

### Características Técnicas
- **Web Audio API** - Sonidos dinámicos
- **Local Storage** - Persistencia de datos
- **Touch Events** - Controles móviles
- **Vibration API** - Feedback háptico
- **Intersection Observer** - Optimización de rendimiento

## 🎨 Algoritmos de Resolución

### Método Simplificado (Principiante)
1. **Cruz Blanca** - Formar cruz en la base
2. **Esquinas Blancas** - Completar primera capa
3. **Segunda Capa** - Posicionar aristas medias
4. **Cruz Amarilla** - Cruz en la cara superior
5. **Esquinas Amarillas** - Orientar esquinas
6. **Posición Final** - Permutar piezas finales

### Método CFOP (Avanzado)
1. **Cross** - Cruz eficiente en 8 movimientos
2. **F2L** - First Two Layers simultáneamente
3. **OLL** - Orient Last Layer (57 algoritmos)
4. **PLL** - Permute Last Layer (21 algoritmos)

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dispositivos
- 🖥️ **Desktop** - Experiencia completa
- 📱 **Móviles** - iOS 12+, Android 8+
- 📱 **Tabletas** - Optimizado para touch
- ⌚ **Responsive** - Desde 320px hasta 4K

## 🎯 Funcionalidades Avanzadas

### Controles de Teclado
- **Espacio** - Mezclar cubo
- **Ctrl+S** - Resolver automáticamente
- **Ctrl+R** - Reset completo
- **Escape** - Cerrar modales
- **R, L, U, D, F, B** - Movimientos directos
- **Shift + Letra** - Movimiento inverso

### Gestos Táctiles
- **Tap** - Rotar cara específica
- **Drag** - Rotar vista del cubo
- **Swipe horizontal** - Movimiento U/U'
- **Swipe vertical** - Movimiento R/R'
- **Pinch** - Zoom (próximamente)

### Almacenamiento Local
- **Configuración personal** guardada
- **Historial de soluciones** (últimas 50)
- **Mejor tiempo personal** registrado
- **Preferencias de tema** recordadas

## 🏆 Características Pro

### Estadísticas Avanzadas
- ⏱️ **Timer preciso** al milisegundo
- 📊 **Contador de movimientos** en tiempo real
- 🏅 **Mejor tiempo personal** guardado
- 📈 **Historial completo** de soluciones

### Personalización Completa
- 🎨 **Editor de colores** visual
- 🔊 **Control de audio** granular
- ⚡ **Velocidad de animación** ajustable
- 🎯 **Guías visuales** opcionales

### Experiencia Premium
- ✨ **Efectos de partículas** dinámicos
- 🎆 **Celebración animada** al resolver
- 🔊 **Audio espacial** envolvente
- 💫 **Transiciones fluidas** en cada interacción

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! 

### Áreas de Mejora
- 🧩 Nuevos algoritmos de resolución
- 🎨 Temas visuales adicionales
- 🌍 Internacionalización
- 📊 Análisis de rendimiento
- 🎮 Modos de juego adicionales

### Cómo Contribuir
1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- LinkedIn: [Tu Perfil](https://linkedin.com/in/tu-perfil)

## 🙏 Agradecimientos

- **Three.js** por la increíble biblioteca 3D
- **Vite** por la herramienta de desarrollo ultra-rápida
- **Comunidad de Speedcubing** por los algoritmos
- **Diseñadores** que inspiran interfaces modernas

---

## 🎉 ¡Disfruta Resolviendo Cubos!

**¿Te gustó el proyecto?** ⭐ ¡Dale una estrella en GitHub!

**¿Encontraste un bug?** 🐛 [Reporta un issue](https://github.com/tu-usuario/Solver-RubiksCube/issues)

**¿Tienes ideas?** 💡 [Sugiere mejoras](https://github.com/tu-usuario/Solver-RubiksCube/discussions)

---

*Hecho con ❤️ y mucho ☕ para la comunidad de speedcubing*