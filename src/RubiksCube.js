import * as THREE from 'three';
import { TWEEN } from '@tweenjs/tween.js';

// Colores estándar del cubo de Rubik
const CUBE_COLORS = {
  WHITE: 0xffffff,
  YELLOW: 0xffff00,
  RED: 0xff4444,
  ORANGE: 0xff8800,
  GREEN: 0x44ff44,
  BLUE: 0x4444ff,
  BLACK: 0x333333
};

// Mapeo de caras
const FACE_COLORS = [
  CUBE_COLORS.RED,    // Derecha
  CUBE_COLORS.ORANGE, // Izquierda  
  CUBE_COLORS.WHITE,  // Arriba
  CUBE_COLORS.YELLOW, // Abajo
  CUBE_COLORS.GREEN,  // Frente
  CUBE_COLORS.BLUE    // Atrás
];

class RubiksCube {
  constructor(container) {
    this.container = container;
    this.cubes = [];
    this.group = new THREE.Group();
    this.isAnimating = false;
    this.moveHistory = [];
    this.state = this.generateSolvedState();
    
    this.init();
    this.createCube();
    this.setupControls();
    this.animate();
  }

  init() {
    // Configurar renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance" 
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    // Configurar escena
    this.scene = new THREE.Scene();
    this.scene.background = null; // Fondo transparente

    // Configurar cámara
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);

    // Configurar luces
    this.setupLighting();

    // Manejar resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupLighting() {
    // Luz ambiental suave
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Luz direccional principal
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Luz de relleno
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 0, -5);
    this.scene.add(fillLight);

    // Luz puntual para highlights
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 20);
    pointLight.position.set(0, 5, 5);
    this.scene.add(pointLight);
  }

  createCube() {
    // Limpiar cubo anterior
    this.scene.remove(this.group);
    this.group = new THREE.Group();
    this.cubes = [];

    const cubeSize = 0.95;
    const gap = 0.05;
    const offset = 1;

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
          
          // Crear materiales para cada cara
          const materials = this.createCubeMaterials(x, y, z);
          const cube = new THREE.Mesh(geometry, materials);

          // Posicionar el cubo
          cube.position.set(
            (x - 1) * offset,
            (y - 1) * offset,
            (z - 1) * offset
          );

          // Agregar sombras
          cube.castShadow = true;
          cube.receiveShadow = true;

          // Almacenar posición original
          cube.userData = {
            originalPosition: cube.position.clone(),
            gridPosition: { x, y, z },
            faceColors: this.getFaceColors(x, y, z)
          };

          this.cubes.push(cube);
          this.group.add(cube);
        }
      }
    }

    this.scene.add(this.group);
  }

  createCubeMaterials(x, y, z) {
    const materials = [];
    
    // Determinar qué caras son visibles (exteriores)
    const isVisible = {
      right: x === 2,   // +X
      left: x === 0,    // -X
      top: y === 2,     // +Y
      bottom: y === 0,  // -Y
      front: z === 2,   // +Z
      back: z === 0     // -Z
    };

    const faceOrder = ['right', 'left', 'top', 'bottom', 'front', 'back'];
    
    faceOrder.forEach((face, index) => {
      let color;
      if (isVisible[face]) {
        color = this.state[this.getFaceIndex(x, y, z, face)] || CUBE_COLORS.BLACK;
      } else {
        color = CUBE_COLORS.BLACK;
      }
      
      const material = new THREE.MeshPhongMaterial({ 
        color: color,
        shininess: 100,
        specular: 0x222222
      });
      
      materials.push(material);
    });

    return materials;
  }

  getFaceIndex(x, y, z, face) {
    // Mapear posiciones a índices de caras
    switch (face) {
      case 'right': return x === 2 ? `R_${y}_${2-z}` : null;
      case 'left': return x === 0 ? `L_${y}_${z}` : null;
      case 'top': return y === 2 ? `U_${2-z}_${x}` : null;
      case 'bottom': return y === 0 ? `D_${z}_${x}` : null;
      case 'front': return z === 2 ? `F_${2-y}_${x}` : null;
      case 'back': return z === 0 ? `B_${2-y}_${2-x}` : null;
      default: return null;
    }
  }

  getFaceColors(x, y, z) {
    const colors = {};
    const faces = ['right', 'left', 'top', 'bottom', 'front', 'back'];
    
    faces.forEach(face => {
      const index = this.getFaceIndex(x, y, z, face);
      if (index) {
        colors[face] = this.state[index];
      }
    });
    
    return colors;
  }

  generateSolvedState() {
    const state = {};
    const faces = ['R', 'L', 'U', 'D', 'F', 'B'];
    const colors = [
      CUBE_COLORS.RED,
      CUBE_COLORS.ORANGE,
      CUBE_COLORS.WHITE,
      CUBE_COLORS.YELLOW,
      CUBE_COLORS.GREEN,
      CUBE_COLORS.BLUE
    ];

    faces.forEach((face, faceIndex) => {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          state[`${face}_${i}_${j}`] = colors[faceIndex];
        }
      }
    });

    return state;
  }

  setupControls() {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    this.renderer.domElement.addEventListener('mousedown', (event) => {
      if (this.isAnimating) return;
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    this.renderer.domElement.addEventListener('mousemove', (event) => {
      if (!isDragging || this.isAnimating) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };

      // Rotar grupo
      this.group.rotation.y += deltaMove.x * 0.01;
      this.group.rotation.x += deltaMove.y * 0.01;

      previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    this.renderer.domElement.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Controles táctiles
    this.setupTouchControls();
    
    // Controles de teclado
    this.setupKeyboardControls();
  }

  setupTouchControls() {
    let isTouching = false;
    let previousTouchPosition = { x: 0, y: 0 };
    let touchStartTime = 0;
    let touchMoved = false;

    this.renderer.domElement.addEventListener('touchstart', (event) => {
      if (this.isAnimating) return;
      event.preventDefault();
      isTouching = true;
      touchMoved = false;
      touchStartTime = Date.now();
      const touch = event.touches[0];
      previousTouchPosition = { x: touch.clientX, y: touch.clientY };
    });

    this.renderer.domElement.addEventListener('touchmove', (event) => {
      if (!isTouching || this.isAnimating) return;
      event.preventDefault();
      touchMoved = true;
      
      const touch = event.touches[0];
      const deltaMove = {
        x: touch.clientX - previousTouchPosition.x,
        y: touch.clientY - previousTouchPosition.y
      };

      // Rotación más suave en móviles
      this.group.rotation.y += deltaMove.x * 0.008;
      this.group.rotation.x += deltaMove.y * 0.008;

      previousTouchPosition = { x: touch.clientX, y: touch.clientY };
    });

    this.renderer.domElement.addEventListener('touchend', (event) => {
      event.preventDefault();
      const touchDuration = Date.now() - touchStartTime;
      
      // Detección de tap rápido para movimientos
      if (!touchMoved && touchDuration < 300) {
        this.handleTouchTap(event.changedTouches[0]);
      }
      
      isTouching = false;
    });

    // Gestos de swipe para movimientos
    this.setupSwipeGestures();
  }

  setupSwipeGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let swipeStartTime = 0;

    this.renderer.domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) { // Gestos con dos dedos
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        swipeStartTime = Date.now();
      }
    }, { passive: true });

    this.renderer.domElement.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1 && Date.now() - swipeStartTime < 500) {
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        this.handleSwipe();
      }
    }, { passive: true });
  }

  handleTouchTap(touch) {
    // Convertir coordenadas de pantalla a mundo 3D
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = {
      x: ((touch.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((touch.clientY - rect.top) / rect.height) * 2 + 1
    };

    // Crear raycaster para detectar cubo tocado
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.cubes);
    if (intersects.length > 0) {
      const intersectedCube = intersects[0].object;
      this.handleCubeTouch(intersectedCube, intersects[0]);
    }
  }

  handleCubeTouch(cube, intersection) {
    // Determinar cara tocada y ejecutar movimiento inteligente
    const faceIndex = intersection.face.materialIndex;
    const position = cube.userData.gridPosition;
    
    // Lógica para determinar qué movimiento hacer basado en la cara tocada
    const faceToMove = {
      0: position.x === 2 ? 'R' : null,  // Cara derecha
      1: position.x === 0 ? 'L' : null,  // Cara izquierda  
      2: position.y === 2 ? 'U' : null,  // Cara superior
      3: position.y === 0 ? 'D' : null,  // Cara inferior
      4: position.z === 2 ? 'F' : null,  // Cara frontal
      5: position.z === 0 ? 'B' : null   // Cara trasera
    };

    const move = faceToMove[faceIndex];
    if (move) {
      this.executeMove(move);
      this.dispatchTouchFeedback();
    }
  }

  handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
      // Determinar dirección del swipe
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Swipe horizontal
        if (deltaX > 0) {
          this.executeMove('U'); // Swipe derecha = U
        } else {
          this.executeMove("U'"); // Swipe izquierda = U'
        }
      } else {
        // Swipe vertical
        if (deltaY > 0) {
          this.executeMove('R'); // Swipe abajo = R
        } else {
          this.executeMove("R'"); // Swipe arriba = R'
        }
      }
    }
  }

  dispatchTouchFeedback() {
    // Feedback háptico en dispositivos compatibles
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Evento personalizado para feedback visual/audio
    const event = new CustomEvent('cubeTouchFeedback');
    this.container.dispatchEvent(event);
  }

  setupKeyboardControls() {
    document.addEventListener('keydown', (event) => {
      if (this.isAnimating) return;

      const keyMoves = {
        'KeyR': 'R',
        'KeyL': 'L',
        'KeyU': 'U',
        'KeyD': 'D',
        'KeyF': 'F',
        'KeyB': 'B'
      };

      let move = keyMoves[event.code];
      if (move) {
        if (event.shiftKey) move += "'";
        this.executeMove(move);
      }
    });
  }

  // Ejecutar movimiento
  executeMove(move, animate = true) {
    if (this.isAnimating) return false;

    const moveMap = {
      'R': () => this.rotateLayer('x', 2, Math.PI / 2),
      "R'": () => this.rotateLayer('x', 2, -Math.PI / 2),
      'L': () => this.rotateLayer('x', 0, -Math.PI / 2),
      "L'": () => this.rotateLayer('x', 0, Math.PI / 2),
      'U': () => this.rotateLayer('y', 2, Math.PI / 2),
      "U'": () => this.rotateLayer('y', 2, -Math.PI / 2),
      'D': () => this.rotateLayer('y', 0, -Math.PI / 2),
      "D'": () => this.rotateLayer('y', 0, Math.PI / 2),
      'F': () => this.rotateLayer('z', 2, Math.PI / 2),
      "F'": () => this.rotateLayer('z', 2, -Math.PI / 2),
      'B': () => this.rotateLayer('z', 0, -Math.PI / 2),
      "B'": () => this.rotateLayer('z', 0, Math.PI / 2),
    };

    if (moveMap[move]) {
      if (animate) {
        this.isAnimating = true;
        this.moveHistory.push(move);
        moveMap[move]();
        return true;
      } else {
        // Movimiento instantáneo para mezclar
        moveMap[move]();
        this.updateCubeState();
        return true;
      }
    }

    return false;
  }

  rotateLayer(axis, layer, angle) {
    // Encontrar cubos en la capa
    const cubesInLayer = this.cubes.filter(cube => {
      const pos = cube.userData.gridPosition;
      return pos[axis] === layer;
    });

    // Crear grupo temporal para animación
    const rotationGroup = new THREE.Group();
    this.scene.add(rotationGroup);

    // Mover cubos al grupo de rotación
    cubesInLayer.forEach(cube => {
      const worldPosition = new THREE.Vector3();
      cube.getWorldPosition(worldPosition);
      
      this.group.remove(cube);
      rotationGroup.add(cube);
      
      cube.position.copy(worldPosition);
    });

    // Animar rotación
    const startRotation = rotationGroup.rotation[axis];
    const endRotation = startRotation + angle;

    new TWEEN.Tween({ rotation: startRotation })
      .to({ rotation: endRotation }, 300)
      .easing(TWEEN.Easing.Cubic.Out)
      .onUpdate((obj) => {
        rotationGroup.rotation[axis] = obj.rotation;
      })
      .onComplete(() => {
        // Volver a agregar cubos al grupo principal
        cubesInLayer.forEach(cube => {
          const worldPosition = new THREE.Vector3();
          const worldQuaternion = new THREE.Quaternion();
          cube.getWorldPosition(worldPosition);
          cube.getWorldQuaternion(worldQuaternion);
          
          rotationGroup.remove(cube);
          this.group.add(cube);
          
          cube.position.copy(worldPosition);
          cube.quaternion.copy(worldQuaternion);
          
          // Actualizar posición en grid
          this.updateCubeGridPosition(cube, axis, angle);
        });

        this.scene.remove(rotationGroup);
        this.updateCubeState();
        this.isAnimating = false;
        
        // Disparar evento de movimiento completado
        this.dispatchMoveComplete();
      })
      .start();
  }

  updateCubeGridPosition(cube, axis, angle) {
    const pos = cube.userData.gridPosition;
    const center = 1; // Centro del cubo 3x3
    
    // Normalizar ángulo
    const normalizedAngle = angle > 0 ? 1 : -1;
    
    if (axis === 'x') {
      // Rotación alrededor del eje X
      const newY = center + normalizedAngle * (pos.z - center);
      const newZ = center - normalizedAngle * (pos.y - center);
      pos.y = newY;
      pos.z = newZ;
    } else if (axis === 'y') {
      // Rotación alrededor del eje Y  
      const newX = center - normalizedAngle * (pos.z - center);
      const newZ = center + normalizedAngle * (pos.x - center);
      pos.x = newX;
      pos.z = newZ;
    } else if (axis === 'z') {
      // Rotación alrededor del eje Z
      const newX = center + normalizedAngle * (pos.y - center);
      const newY = center - normalizedAngle * (pos.x - center);
      pos.x = newX;
      pos.y = newY;
    }
  }

  updateCubeState() {
    // Actualizar estado del cubo basado en posiciones actuales
    this.cubes.forEach(cube => {
      const pos = cube.userData.gridPosition;
      cube.userData.faceColors = this.getFaceColors(pos.x, pos.y, pos.z);
      
      // Actualizar materiales
      const materials = this.createCubeMaterials(pos.x, pos.y, pos.z);
      cube.material = materials;
    });
  }

  // Mezclar cubo
  scramble(moves = 20) {
    if (this.isAnimating) return;

    const possibleMoves = ['R', "R'", 'L', "L'", 'U', "U'", 'D', "D'", 'F', "F'", 'B', "B'"];
    const scrambleMoves = [];

    for (let i = 0; i < moves; i++) {
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      scrambleMoves.push(randomMove);
      this.executeMove(randomMove, false);
    }

    // Actualizar visualización
    this.updateCubeState();
    
    console.log('Scramble:', scrambleMoves.join(' '));
    return scrambleMoves;
  }

  // Resetear cubo
  reset() {
    if (this.isAnimating) return;

    this.state = this.generateSolvedState();
    this.moveHistory = [];
    this.createCube();
    this.dispatchStateChange();
  }

  // Verificar si está resuelto
  isSolved() {
    const solvedState = this.generateSolvedState();
    return JSON.stringify(this.state) === JSON.stringify(solvedState);
  }

  // Obtener estado actual
  getState() {
    return { ...this.state };
  }

  // Establecer estado
  setState(newState) {
    this.state = { ...newState };
    this.updateCubeState();
  }

  // Eventos personalizados
  dispatchMoveComplete() {
    const event = new CustomEvent('cubeMove', {
      detail: {
        move: this.moveHistory[this.moveHistory.length - 1],
        moveCount: this.moveHistory.length,
        isSolved: this.isSolved()
      }
    });
    this.container.dispatchEvent(event);
  }

  dispatchStateChange() {
    const event = new CustomEvent('cubeStateChange', {
      detail: {
        state: this.getState(),
        isSolved: this.isSolved()
      }
    });
    this.container.dispatchEvent(event);
  }

  // Redimensionado
  onWindowResize() {
    if (!this.container.parentElement) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // Bucle de animación
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    TWEEN.update();
    
    // Rotación automática sutil cuando no hay interacción
    if (!this.isAnimating) {
      this.group.rotation.y += 0.002;
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  // Limpiar recursos
  dispose() {
    this.renderer.dispose();
    this.scene.clear();
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}

export default RubiksCube;