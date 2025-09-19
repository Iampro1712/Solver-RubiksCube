import './styles.css';
import RubiksCube from './RubiksCube.js';
import RubiksSolver from './RubiksSolver.js';

class RubiksApp {
  constructor() {
    this.cube = null;
    this.solver = new RubiksSolver();
    this.currentSolution = null;
    this.solutionIndex = 0;
    this.timer = null;
    this.startTime = null;
    this.moveCount = 0;
    this.bestTime = localStorage.getItem('bestTime') || null;
    this.soundEnabled = true;
    this.currentTheme = 'dark';
    this.isAutoSolving = false;
    this.solutionHistory = JSON.parse(localStorage.getItem('solutionHistory')) || [];
    this.currentTutorial = null;
    this.tutorialStep = 0;
    this.selectedColor = 'white';
    
    this.init();
  }

  async init() {
    // Remover loader
    setTimeout(() => {
      const loader = document.getElementById('loader');
      loader?.classList.add('hidden');
    }, 1000);

    // Inicializar cubo
    this.initCube();
    
    // Configurar UI
    this.setupUI();
    
    // Configurar eventos
    this.setupEventListeners();
    
    // Cargar configuración guardada
    this.loadSettings();
    
    // Inicializar partículas
    this.initParticles();
    
    // Inicializar optimizaciones móviles
    this.initMobileOptimizations();
    
    console.log('🎮 Rubik\'s Cube Solver iniciado correctamente');
  }

  initCube() {
    const container = document.getElementById('cubeRenderer');
    if (!container) {
      console.error('Container del cubo no encontrado');
      return;
    }

    try {
      this.cube = new RubiksCube(container);
      
    // Eventos del cubo
    container.addEventListener('cubeMove', (event) => {
      this.onCubeMove(event.detail);
    });
    
    container.addEventListener('cubeStateChange', (event) => {
      this.onCubeStateChange(event.detail);
    });

    // Feedback háptico para móviles
    container.addEventListener('cubeTouchFeedback', () => {
      this.provideTouchFeedback();
    });    } catch (error) {
      console.error('Error inicializando el cubo:', error);
      this.showError('Error al cargar el cubo 3D. Recarga la página.');
    }
  }

  setupUI() {
    // Configurar navegación
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchSection(btn.dataset.section);
      });
    });

    // Actualizar estadísticas iniciales
    this.updateStats();
    
    // Configurar mejor tiempo
    if (this.bestTime) {
      document.getElementById('bestTime').textContent = this.formatTime(this.bestTime);
    }
  }

  setupEventListeners() {
    // Botones principales
    document.getElementById('scrambleBtn')?.addEventListener('click', () => {
      this.scrambleCube();
    });

    document.getElementById('resetBtn')?.addEventListener('click', () => {
      this.resetCube();
    });

    document.getElementById('solveBtn')?.addEventListener('click', () => {
      this.solveCube();
    });

    // Controles de tema y sonido
    document.getElementById('themeToggle')?.addEventListener('click', () => {
      this.toggleTheme();
    });

    document.getElementById('soundToggle')?.addEventListener('click', () => {
      this.toggleSound();
    });

    // Configuraciones
    document.getElementById('animationSpeed')?.addEventListener('input', (e) => {
      this.setAnimationSpeed(e.target.value);
    });

    document.getElementById('showGuides')?.addEventListener('change', (e) => {
      this.toggleGuides(e.target.checked);
    });

    document.getElementById('moveSounds')?.addEventListener('change', (e) => {
      this.soundEnabled = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('volume')?.addEventListener('input', (e) => {
      this.setVolume(e.target.value);
    });

    // Celebración
    document.getElementById('celebrationClose')?.addEventListener('click', () => {
      this.hideCelebration();
    });

    // Entrada manual
    document.getElementById('manualInputBtn')?.addEventListener('click', () => {
      this.showManualInput();
    });

    document.getElementById('closeManualInput')?.addEventListener('click', () => {
      this.hideManualInput();
    });

    document.getElementById('resetColors')?.addEventListener('click', () => {
      this.resetManualColors();
    });

    document.getElementById('applyColors')?.addEventListener('click', () => {
      this.applyManualColors();
    });

    // Historial
    document.getElementById('historyBtn')?.addEventListener('click', () => {
      this.showHistory();
    });

    document.getElementById('closeHistory')?.addEventListener('click', () => {
      this.hideHistory();
    });

    document.getElementById('clearHistory')?.addEventListener('click', () => {
      this.clearHistory();
    });

    // Tutorial interactivo
    document.querySelectorAll('.tutorial-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action || e.target.parentElement.dataset.action;
        this.startTutorial(action);
      });
    });

    document.getElementById('closeTutorial')?.addEventListener('click', () => {
      this.closeTutorial();
    });

    document.getElementById('prevStep')?.addEventListener('click', () => {
      this.prevTutorialStep();
    });

    document.getElementById('nextStep')?.addEventListener('click', () => {
      this.nextTutorialStep();
    });

    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
      this.handleKeyPress(e);
    });

    // Redimensionado
    window.addEventListener('resize', () => {
      this.cube?.onWindowResize();
    });
  }

  // Navegación entre secciones
  switchSection(section) {
    // Actualizar botones
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`)?.classList.add('active');

    // Mostrar sección
    document.querySelectorAll('.solver-section, .tutorial-section, .settings-section').forEach(sec => {
      sec.classList.remove('active');
    });
    document.getElementById(section)?.classList.add('active');
  }

  // Funciones del cubo
  scrambleCube() {
    if (!this.cube || this.cube.isAnimating) return;

    this.playSound('scramble');
    const scrambleMoves = this.cube.scramble(25);
    this.resetTimer();
    this.moveCount = 0;
    this.updateStats();
    
    this.showNotification('🎲 Cubo mezclado - ¡Hora de resolver!', 'info');
    this.clearSolution();
  }

  resetCube() {
    if (!this.cube || this.cube.isAnimating) return;

    this.cube.reset();
    this.resetTimer();
    this.moveCount = 0;
    this.updateStats();
    this.clearSolution();
    this.playSound('reset');
    
    this.showNotification('🔄 Cubo reiniciado', 'success');
  }

  async solveCube() {
    if (!this.cube || this.cube.isAnimating || this.isAutoSolving) return;

    try {
      this.showNotification('🤖 Calculando solución...', 'info');
      
      // Obtener estado del cubo
      const cubeState = this.cube.getState();
      
      // Resolver usando el algoritmo
      const result = this.solver.solve(cubeState);
      
      if (result.success) {
        this.currentSolution = result;
        this.displaySolution(result);
        this.showNotification(`✅ Solución encontrada: ${result.totalMoves} movimientos`, 'success');
        
        // Guardar en historial
        this.saveSolutionToHistory(result);
        
        // Preguntar si ejecutar automáticamente
        this.showSolutionDialog(result);
      } else {
        this.showNotification('❌ ' + (result.error || 'No se pudo resolver'), 'error');
      }
      
    } catch (error) {
      console.error('Error resolviendo:', error);
      this.showNotification('❌ Error al calcular la solución', 'error');
    }
  }

  async executeSolution(solution) {
    if (!solution || this.isAutoSolving) return;

    this.isAutoSolving = true;
    this.solutionIndex = 0;
    
    this.showNotification('🚀 Ejecutando solución automática...', 'info');

    try {
      for (const move of solution.moves) {
        await this.executeMove(move);
        await this.delay(400); // Pausa entre movimientos
        this.solutionIndex++;
      }
      
      this.showNotification('🎉 ¡Solución completada!', 'success');
      
      if (this.cube.isSolved()) {
        this.onCubeSolved();
      }
      
    } catch (error) {
      console.error('Error ejecutando solución:', error);
      this.showNotification('❌ Error ejecutando la solución', 'error');
    } finally {
      this.isAutoSolving = false;
    }
  }

  executeMove(move) {
    return new Promise((resolve) => {
      if (this.cube.executeMove(move)) {
        // Esperar a que termine la animación
        const checkAnimation = () => {
          if (!this.cube.isAnimating) {
            resolve();
          } else {
            setTimeout(checkAnimation, 50);
          }
        };
        checkAnimation();
      } else {
        resolve();
      }
    });
  }

  // Eventos del cubo
  onCubeMove(detail) {
    this.moveCount++;
    this.updateStats();
    this.playSound('move');

    // Iniciar timer si es el primer movimiento
    if (this.moveCount === 1 && !this.timer) {
      this.startTimer();
    }

    // Verificar si está resuelto
    if (detail.isSolved) {
      this.onCubeSolved();
    }
  }

  onCubeStateChange(detail) {
    // Actualizar UI basado en el estado
    if (detail.isSolved) {
      this.onCubeSolved();
    }
  }

  onCubeSolved() {
    this.stopTimer();
    
    const solveTime = this.getElapsedTime();
    
    // Actualizar mejor tiempo
    if (!this.bestTime || solveTime < this.bestTime) {
      this.bestTime = solveTime;
      localStorage.setItem('bestTime', this.bestTime.toString());
      document.getElementById('bestTime').textContent = this.formatTime(this.bestTime);
      this.showNotification('🏆 ¡Nuevo récord personal!', 'success');
    }

    // Mostrar celebración
    this.showCelebration(solveTime, this.moveCount);
    
    this.playSound('solved');
    this.createFireworks();
  }

  // Timer
  startTimer() {
    this.startTime = Date.now();
    this.timer = setInterval(() => {
      const elapsed = this.getElapsedTime();
      document.getElementById('timer').textContent = this.formatTime(elapsed);
    }, 10);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  resetTimer() {
    this.stopTimer();
    this.startTime = null;
    document.getElementById('timer').textContent = '00:00';
  }

  getElapsedTime() {
    return this.startTime ? Date.now() - this.startTime : 0;
  }

  formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }

  // Actualizar estadísticas
  updateStats() {
    document.getElementById('moveCounter').textContent = this.moveCount.toString();
  }

  // Mostrar solución
  displaySolution(result) {
    const container = document.getElementById('algorithmSteps');
    container.innerHTML = '';

    result.steps.forEach((step, stepIndex) => {
      const stepElement = document.createElement('div');
      stepElement.className = 'step-group';
      stepElement.innerHTML = `
        <h4 class="step-title">
          <span class="step-icon">${step.icon}</span>
          ${step.name}
        </h4>
        <p class="step-description">${step.description}</p>
        <div class="step-moves">
          ${step.moves.map((move, index) => `
            <div class="step-item" data-step="${stepIndex}" data-move="${index}">
              <span class="step-number">${index + 1}</span>
              <span class="step-move">${move}</span>
              <span class="step-description">${this.solver.getMoveDescription(move)}</span>
            </div>
          `).join('')}
        </div>
      `;
      
      container.appendChild(stepElement);
    });

    // Agregar botón de ejecución
    const executeBtn = document.createElement('button');
    executeBtn.className = 'control-btn success execute-solution-btn';
    executeBtn.innerHTML = '<i class="fas fa-play"></i> <span>Ejecutar Solución</span>';
    executeBtn.onclick = () => this.executeSolution(result);
    
    container.appendChild(executeBtn);
  }

  clearSolution() {
    const container = document.getElementById('algorithmSteps');
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-lightbulb"></i>
        <p>Mezcla el cubo y presiona "Resolver" para ver los pasos</p>
      </div>
    `;
    this.currentSolution = null;
  }

  // Mostrar diálogo de solución
  showSolutionDialog(result) {
    // Implementación simple con confirm
    const execute = confirm(`Solución encontrada con ${result.totalMoves} movimientos.\n¿Quieres ejecutarla automáticamente?`);
    if (execute) {
      setTimeout(() => this.executeSolution(result), 500);
    }
  }

  // Celebración
  showCelebration(time, moves) {
    document.getElementById('celebrationTime').textContent = this.formatTime(time);
    document.getElementById('celebrationMoves').textContent = moves.toString();
    document.getElementById('celebration').classList.remove('hidden');
  }

  hideCelebration() {
    document.getElementById('celebration').classList.add('hidden');
  }

  // Efectos visuales
  createFireworks() {
    // Crear elementos de fuegos artificiales
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.cssText = `
          position: fixed;
          width: 4px;
          height: 4px;
          background: hsl(${Math.random() * 360}, 100%, 50%);
          border-radius: 50%;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          animation: fireworkExplode 1s ease-out forwards;
          pointer-events: none;
          z-index: 9999;
        `;
        
        document.body.appendChild(firework);
        
        setTimeout(() => firework.remove(), 1000);
      }, i * 100);
    }
  }

  initParticles() {
    const particles = document.getElementById('particles');
    
    // Agregar estilos de animación para partículas
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fireworkExplode {
        0% { 
          transform: scale(0) translateY(0);
          opacity: 1;
        }
        50% {
          transform: scale(1) translateY(-20px);
          opacity: 1;
        }
        100% { 
          transform: scale(0) translateY(-40px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Audio
  playSound(type) {
    if (!this.soundEnabled) return;

    // Simulación de sonidos usando Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const frequencies = {
        move: 220,
        solved: 440,
        scramble: 330,
        reset: 260
      };

      oscillator.frequency.setValueAtTime(frequencies[type] || 220, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
    } catch (error) {
      // Fallback silencioso si no hay soporte de audio
    }
  }

  // Configuración
  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    
    const icon = document.querySelector('#themeToggle i');
    icon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    this.saveSettings();
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const icon = document.querySelector('#soundToggle i');
    icon.className = this.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    
    document.getElementById('moveSounds').checked = this.soundEnabled;
    this.saveSettings();
  }

  setAnimationSpeed(speed) {
    // Implementar velocidad de animación
    console.log('Animation speed:', speed);
  }

  toggleGuides(show) {
    // Implementar mostrar/ocultar guías
    console.log('Show guides:', show);
  }

  setVolume(volume) {
    // Implementar control de volumen
    console.log('Volume:', volume);
  }

  // Persistencia
  saveSettings() {
    const settings = {
      theme: this.currentTheme,
      soundEnabled: this.soundEnabled,
      bestTime: this.bestTime
    };
    
    localStorage.setItem('rubiksSettings', JSON.stringify(settings));
  }

  loadSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('rubiksSettings')) || {};
      
      this.currentTheme = settings.theme || 'dark';
      this.soundEnabled = settings.soundEnabled !== false;
      this.bestTime = settings.bestTime || null;
      
      // Aplicar configuración
      document.documentElement.setAttribute('data-theme', this.currentTheme);
      document.querySelector('#themeToggle i').className = 
        this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      document.querySelector('#soundToggle i').className = 
        this.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        
    } catch (error) {
      console.log('Error cargando configuración:', error);
    }
  }

  // Notificaciones
  showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    // Estilos
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: var(--border-glass);
      border-radius: var(--border-radius);
      padding: var(--spacing-md);
      color: var(--text-primary);
      z-index: 1000;
      animation: slideInRight 0.3s ease;
      max-width: 350px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
    
    // Botón cerrar
    notification.querySelector('.notification-close').onclick = () => {
      notification.remove();
    };
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  // Atajos de teclado
  handleKeyPress(e) {
    if (e.target.tagName === 'INPUT') return;
    
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        this.scrambleCube();
        break;
      case 'KeyS':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.solveCube();
        }
        break;
      case 'KeyR':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.resetCube();
        }
        break;
      case 'Escape':
        this.hideCelebration();
        break;
    }
  }

  // Utilidad
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ===== FUNCIONES INTERACTIVAS =====

  // Entrada manual de colores
  showManualInput() {
    document.getElementById('manualInputModal').classList.remove('hidden');
    this.generateCubeNet();
    this.setupColorPicker();
  }

  hideManualInput() {
    document.getElementById('manualInputModal').classList.add('hidden');
  }

  generateCubeNet() {
    const net = document.getElementById('cubeNet');
    net.innerHTML = '';

    // Layout del cubo desplegado
    const layout = [
      [null, 'U', null, null],
      ['L', 'F', 'R', 'B'],
      [null, 'D', null, null]
    ];

    const colors = {
      U: '#ffffff', D: '#ffff00', F: '#44ff44',
      B: '#4444ff', R: '#ff4444', L: '#ff8800'
    };

    layout.forEach((row, rowIndex) => {
      row.forEach((face, colIndex) => {
        const faceDiv = document.createElement('div');
        faceDiv.className = 'net-face';
        faceDiv.style.gridColumn = `${colIndex * 3 + 1} / span 3`;
        faceDiv.style.gridRow = `${rowIndex * 3 + 1} / span 3`;

        if (face) {
          for (let i = 0; i < 9; i++) {
            const square = document.createElement('div');
            square.className = 'net-square';
            square.style.background = colors[face];
            square.dataset.face = face;
            square.dataset.position = i;
            
            square.addEventListener('click', () => {
              this.changeSquareColor(square);
            });

            faceDiv.appendChild(square);
          }
        }

        if (face || colIndex < 3) {
          net.appendChild(faceDiv);
        }
      });
    });
  }

  setupColorPicker() {
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        colorOptions.forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        this.selectedColor = option.dataset.color;
      });
    });
  }

  changeSquareColor(square) {
    const colorMap = {
      white: '#ffffff',
      yellow: '#ffff00',
      red: '#ff4444',
      orange: '#ff8800',
      green: '#44ff44',
      blue: '#4444ff'
    };

    square.style.background = colorMap[this.selectedColor];
    square.dataset.color = this.selectedColor;
  }

  resetManualColors() {
    this.generateCubeNet();
  }

  applyManualColors() {
    // Aplicar colores al cubo 3D
    const squares = document.querySelectorAll('.net-square[data-color]');
    const newState = {};

    squares.forEach(square => {
      const face = square.dataset.face;
      const position = parseInt(square.dataset.position);
      const color = square.dataset.color;
      
      // Mapear posición a coordenadas del cubo
      const row = Math.floor(position / 3);
      const col = position % 3;
      
      const colorMap = {
        white: 0xffffff,
        yellow: 0xffff00,
        red: 0xff4444,
        orange: 0xff8800,
        green: 0x44ff44,
        blue: 0x4444ff
      };

      newState[`${face}_${row}_${col}`] = colorMap[color];
    });

    if (Object.keys(newState).length > 0) {
      this.cube.setState(newState);
      this.hideManualInput();
      this.showNotification('🎨 Colores aplicados al cubo', 'success');
    }
  }

  // Historial de soluciones
  saveSolutionToHistory(solution) {
    const historyItem = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      moves: solution.moves,
      totalMoves: solution.totalMoves,
      steps: solution.steps,
      time: this.getElapsedTime(),
      moveCount: this.moveCount
    };

    this.solutionHistory.unshift(historyItem);
    
    // Mantener solo los últimos 50 elementos
    if (this.solutionHistory.length > 50) {
      this.solutionHistory = this.solutionHistory.slice(0, 50);
    }

    localStorage.setItem('solutionHistory', JSON.stringify(this.solutionHistory));
  }

  showHistory() {
    document.getElementById('historyModal').classList.remove('hidden');
    this.renderHistory();
  }

  hideHistory() {
    document.getElementById('historyModal').classList.add('hidden');
  }

  renderHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    if (this.solutionHistory.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-history"></i>
          <p>No hay soluciones guardadas aún</p>
        </div>
      `;
      return;
    }

    this.solutionHistory.forEach((item, index) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.innerHTML = `
        <div class="history-header">
          <div class="history-title">Solución #${this.solutionHistory.length - index}</div>
          <div class="history-date">${item.date}</div>
        </div>
        <div class="history-stats">
          <span><i class="fas fa-clock"></i> ${this.formatTime(item.time)}</span>
          <span><i class="fas fa-hand-paper"></i> ${item.moveCount} movimientos</span>
          <span><i class="fas fa-route"></i> ${item.totalMoves} pasos</span>
        </div>
        <div class="history-moves">${item.moves.join(' ')}</div>
      `;

      historyItem.addEventListener('click', () => {
        this.loadSolutionFromHistory(item);
      });

      historyList.appendChild(historyItem);
    });
  }

  loadSolutionFromHistory(historyItem) {
    const solution = {
      success: true,
      moves: historyItem.moves,
      totalMoves: historyItem.totalMoves,
      steps: historyItem.steps || [
        {
          name: 'Solución del Historial',
          description: `Solución guardada el ${historyItem.date}`,
          moves: historyItem.moves,
          icon: '📋'
        }
      ]
    };

    this.currentSolution = solution;
    this.displaySolution(solution);
    this.hideHistory();
    this.switchSection('solver');
    this.showNotification('📋 Solución cargada del historial', 'success');
  }

  clearHistory() {
    if (confirm('¿Estás seguro de que quieres limpiar todo el historial?')) {
      this.solutionHistory = [];
      localStorage.removeItem('solutionHistory');
      this.renderHistory();
      this.showNotification('🗑️ Historial limpiado', 'success');
    }
  }

  // Tutorial interactivo
  startTutorial(action) {
    const tutorials = {
      'start-beginner': {
        title: 'Método Principiante',
        steps: [
          {
            title: '¡Bienvenido al Tutorial!',
            content: 'Aprenderemos el método más fácil para resolver el cubo de Rubik paso a paso. Este tutorial te guiará desde cero hasta completar tu primer cubo.',
            algorithm: null
          },
          {
            title: 'Paso 1: La Cruz Blanca',
            content: 'Primero formaremos una cruz blanca en la cara inferior. Busca las aristas blancas y colócalas usando estos algoritmos básicos:',
            algorithm: 'F R U R\' F\''
          },
          {
            title: 'Paso 2: Esquinas Blancas',
            content: 'Ahora completaremos la primera capa colocando las esquinas blancas. Usa este algoritmo para cada esquina:',
            algorithm: 'R U R\' U\''
          },
          {
            title: 'Paso 3: Segunda Capa',
            content: 'Posicionaremos las aristas de la segunda capa usando algoritmos específicos para derecha e izquierda:',
            algorithm: 'U R U\' R\' U\' F\' U F'
          },
          {
            title: 'Paso 4: Cruz Amarilla',
            content: 'Formaremos la cruz amarilla en la cara superior con este algoritmo fundamental:',
            algorithm: 'F R U R\' U\' F\''
          },
          {
            title: 'Paso 5: Esquinas Amarillas',
            content: 'Orientaremos todas las esquinas amarillas hacia arriba:',
            algorithm: 'R U R\' U R U U R\''
          },
          {
            title: '¡Felicidades!',
            content: 'Has aprendido los fundamentos para resolver el cubo de Rubik. Con práctica, podrás resolver cualquier cubo mezclado. ¡Sigue practicando!',
            algorithm: null
          }
        ]
      },
      'start-cfop': {
        title: 'Método CFOP',
        steps: [
          {
            title: 'Método CFOP Avanzado',
            content: 'CFOP significa Cross, F2L, OLL, PLL. Es el método más popular entre speedcubers profesionales.',
            algorithm: null
          },
          {
            title: 'Cross (Cruz)',
            content: 'Forma la cruz blanca en máximo 8 movimientos. Practica hasta hacerlo sin mirar:',
            algorithm: 'Inspección + Cruz eficiente'
          },
          {
            title: 'F2L (First Two Layers)',
            content: 'Resuelve esquina y arista simultáneamente. Hay 41 casos diferentes:',
            algorithm: 'R U\' R\' F R F\''
          },
          {
            title: 'OLL (Orient Last Layer)',
            content: 'Orienta la última capa. Existen 57 algoritmos OLL diferentes:',
            algorithm: 'R U R\' U R U\' R\' U\' R\' F R F\''
          },
          {
            title: 'PLL (Permute Last Layer)',
            content: 'Permuta la última capa. Son 21 algoritmos PLL para dominar:',
            algorithm: 'R\' F R\' B\' B R F\' R\' B\' B R R'
          }
        ]
      },
      'start-advanced': {
        title: 'Algoritmos Avanzados',
        steps: [
          {
            title: 'Algoritmos de Velocidad',
            content: 'Técnicas avanzadas para resolver en menos de 20 segundos.',
            algorithm: null
          },
          {
            title: 'Fingertricks',
            content: 'Movimientos rápidos con los dedos para ejecutar algoritmos súper rápido:',
            algorithm: 'R U R\' U\' (con flicks)'
          },
          {
            title: 'Lookahead',
            content: 'Técnica para ver las piezas mientras ejecutas algoritmos sin pausas.',
            algorithm: 'Practica con un cubo semi-mezclado'
          },
          {
            title: 'Algoritmos 1LLL',
            content: 'Resolver la última capa en solo un paso (42 algoritmos):',
            algorithm: 'R U R\' F\' R U R\' U\' R\' F R R U\' R\' U\''
          }
        ]
      }
    };

    this.currentTutorial = tutorials[action] || tutorials['start-beginner'];
    this.tutorialStep = 0;
    this.showTutorialModal();
    this.renderTutorialStep();
  }

  showTutorialModal() {
    document.getElementById('interactiveTutorial').style.display = 'flex';
    document.getElementById('tutorialTitle').textContent = this.currentTutorial.title;
  }

  closeTutorial() {
    document.getElementById('interactiveTutorial').style.display = 'none';
    this.currentTutorial = null;
    this.tutorialStep = 0;
  }

  renderTutorialStep() {
    if (!this.currentTutorial) return;

    const step = this.currentTutorial.steps[this.tutorialStep];
    const stepsContainer = document.getElementById('tutorialSteps');
    
    stepsContainer.innerHTML = `
      <div class="tutorial-step active">
        <h4>${step.title}</h4>
        <div class="tutorial-step-content">
          <p>${step.content}</p>
          ${step.algorithm ? `<div class="tutorial-algorithm">${step.algorithm}</div>` : ''}
        </div>
      </div>
    `;

    // Actualizar indicador de paso
    const indicator = document.getElementById('stepIndicator');
    indicator.textContent = `${this.tutorialStep + 1} / ${this.currentTutorial.steps.length}`;

    // Actualizar botones
    document.getElementById('prevStep').disabled = this.tutorialStep === 0;
    document.getElementById('nextStep').disabled = this.tutorialStep === this.currentTutorial.steps.length - 1;
    
    if (this.tutorialStep === this.currentTutorial.steps.length - 1) {
      document.getElementById('nextStep').textContent = 'Finalizar';
      document.getElementById('nextStep').onclick = () => this.closeTutorial();
    } else {
      document.getElementById('nextStep').textContent = 'Siguiente';
      document.getElementById('nextStep').onclick = () => this.nextTutorialStep();
    }
  }

  prevTutorialStep() {
    if (this.tutorialStep > 0) {
      this.tutorialStep--;
      this.renderTutorialStep();
    }
  }

  nextTutorialStep() {
    if (this.tutorialStep < this.currentTutorial.steps.length - 1) {
      this.tutorialStep++;
      this.renderTutorialStep();
    }
  }

  // ===== OPTIMIZACIONES PARA MÓVILES =====

  // Detectar dispositivo móvil
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Feedback háptico
  provideTouchFeedback() {
    if (navigator.vibrate && this.isMobile()) {
      navigator.vibrate(50);
    }
    
    // Feedback visual en el botón tocado
    this.showTouchRipple();
  }

  showTouchRipple() {
    const ripple = document.createElement('div');
    ripple.className = 'touch-ripple';
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(102, 126, 234, 0.3);
      transform: scale(0);
      animation: rippleEffect 0.6s ease-out;
      pointer-events: none;
      z-index: 1000;
    `;

    document.body.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }

  // Optimizar rendimiento para móviles
  optimizeForMobile() {
    if (this.isMobile()) {
      // Reducir calidad de sombras
      if (this.cube && this.cube.renderer) {
        this.cube.renderer.shadowMap.enabled = false;
        this.cube.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      }

      // Desactivar partículas en móviles muy lentos
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        const particles = document.getElementById('particles');
        if (particles) {
          particles.style.display = 'none';
        }
      }

      // Ajustar velocidad de animaciones
      document.documentElement.style.setProperty('--transition-fast', '0.1s ease');
      document.documentElement.style.setProperty('--transition-medium', '0.2s ease');
    }
  }

  // Manejo mejorado de orientación
  handleOrientationChange() {
    setTimeout(() => {
      this.cube?.onWindowResize();
      this.adjustLayoutForOrientation();
    }, 100);
  }

  adjustLayoutForOrientation() {
    if (this.isMobile()) {
      const isLandscape = window.innerWidth > window.innerHeight;
      document.body.classList.toggle('landscape-mode', isLandscape);
      
      if (isLandscape && window.innerHeight < 500) {
        // Modo compacto para landscape
        document.body.classList.add('compact-mode');
      } else {
        document.body.classList.remove('compact-mode');
      }
    }
  }

  // Prevenir zoom accidental en iOS
  preventZoom() {
    document.addEventListener('touchmove', (e) => {
      if (e.scale !== 1) {
        e.preventDefault();
      }
    }, { passive: false });

    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  // Inicializar optimizaciones móviles
  initMobileOptimizations() {
    if (this.isMobile()) {
      this.optimizeForMobile();
      this.preventZoom();
      
      window.addEventListener('orientationchange', () => {
        this.handleOrientationChange();
      });

      // Ocultar barra de dirección en iOS
      window.addEventListener('load', () => {
        setTimeout(() => {
          window.scrollTo(0, 1);
        }, 0);
      });

      // Mejorar scrolling en iOS
      document.body.style.webkitOverflowScrolling = 'touch';
    }
  }
}

// Agregar estilos adicionales
const additionalStyles = `
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}

@keyframes rippleEffect {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

.notification {
  font-weight: 500;
  box-shadow: var(--shadow-strong);
}

.notification-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.notification-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.notification-close:hover {
  background: var(--bg-glass);
  color: var(--text-primary);
}

.step-group {
  margin-bottom: var(--spacing-lg);
}

.step-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  font-size: var(--font-size-lg);
}

.step-icon {
  font-size: var(--font-size-xl);
}

.step-moves {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.execute-solution-btn {
  width: 100%;
  margin-top: var(--spacing-lg);
  justify-content: center;
}

/* Modos de pantalla específicos */
.landscape-mode {
  /* Estilos para modo landscape */
}

.compact-mode .header {
  padding: var(--spacing-xs) 0;
}

.compact-mode .main-content {
  padding: var(--spacing-sm) var(--spacing-md);
}

.compact-mode .cube-renderer {
  height: calc(100vh - 200px);
}

/* Efectos de touch */
.touch-ripple {
  width: 20px;
  height: 20px;
}

/* Mejoras de accesibilidad */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus indicators mejorados */
button:focus-visible,
input:focus-visible,
.tutorial-card:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Estados de carga */
.loading {
  pointer-events: none;
  opacity: 0.7;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid var(--primary-color);
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Indicadores de conexión */
.offline {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: var(--danger-color);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  z-index: 1001;
}
`;

// Agregar estilos al documento
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.rubiksApp = new RubiksApp();
});