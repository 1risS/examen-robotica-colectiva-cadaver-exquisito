// Application state
let isProcessing = false;
let isSystemActive = false;
let isComplete = false;
let currentSegment = 0;
let grid = [];
let letterStates = [];
let randomizationIntervals = [];

// Constants
const GRID_ROWS = 12;
const GRID_COLS = 44;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Message segments data
const messageSegments = [
  {
    esp: "ESP32-01",
    text: "SAMPLE",
    path: [
      { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, 
      { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }
    ]
  },
  {
    esp: "ESP32-02", 
    text: "UNO",
    path: [
      { row: 1, col: 4 }, { row: 1, col: 5 }, { row: 1, col: 6 }
    ]
  },
  {
    esp: "ESP32-03",
    text: "AQUI",
    path: [
      { row: 2, col: 9 }, { row: 2, col: 10 }, { row: 2, col: 11 }, { row: 2, col: 12 }
    ]
  },
  {
    esp: "ESP32-04",
    text: "Y",
    path: [
      { row: 3, col: 14 }
    ]
  },
  {
    esp: "ESP32-05",
    text: "PODEMOS",
    path: [
      { row: 4, col: 8 }, { row: 4, col: 9 }, { row: 4, col: 10 }, { row: 4, col: 11 },
      { row: 4, col: 12 }, { row: 4, col: 13 }, { row: 4, col: 14 }
    ]
  },
  {
    esp: "ESP32-06",
    text: "AGREGAR",
    path: [
      { row: 5, col: 26 }, { row: 5, col: 27 }, { row: 5, col: 28 }, { row: 5, col: 29 },
      { row: 5, col: 30 }, { row: 5, col: 31 }, { row: 5, col: 32 }
    ]
  },
  {
    esp: "ESP32-07",
    text: "MAS",
    path: [
      { row: 6, col: 23 }, { row: 6, col: 24 }, { row: 6, col: 25 }
    ]
  },
  {
    esp: "ESP32-08",
    text: "PALABRAS",
    path: [
      { row: 7, col: 32 }, { row: 7, col: 33 }, { row: 7, col: 34 }, { row: 7, col: 35 },
      { row: 7, col: 36 }, { row: 7, col: 37 }, { row: 7, col: 38 }, { row: 7, col: 39 }
    ]
  },
  {
    esp: "ESP32-09",
    text: "PARA",
    path: [
      { row: 8, col: 18 }, { row: 8, col: 19 }, { row: 8, col: 20 }, { row: 8, col: 21 }
    ]
  },
  {
    esp: "ESP32-10",
    text: "CREAR",
    path: [
      { row: 9, col: 12 }, { row: 9, col: 13 }, { row: 9, col: 14 }, { row: 9, col: 15 }, { row: 9, col: 16 }
    ]
  },
  {
    esp: "ESP32-11",
    text: "ARTE",
    path: [
      { row: 10, col: 28 }, { row: 10, col: 29 }, { row: 10, col: 30 }, { row: 10, col: 31 }
    ]
  },
  {
    esp: "ESP32-12",
    text: "COLABORATIVO",
    path: [
      { row: 11, col: 6 }, { row: 11, col: 7 }, { row: 11, col: 8 }, { row: 11, col: 9 },
      { row: 11, col: 10 }, { row: 11, col: 11 }, { row: 11, col: 12 }, { row: 11, col: 13 },
      { row: 11, col: 14 }, { row: 11, col: 15 }, { row: 11, col: 16 }, { row: 11, col: 17 }
    ]
  }
];

// Generate initial grid
function generateGrid() {
  const newGrid = [];
  for (let i = 0; i < GRID_ROWS; i++) {
    const row = [];
    for (let j = 0; j < GRID_COLS; j++) {
      row.push(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
    }
    newGrid.push(row);
  }
  return newGrid;
}

// Initialize letter states
function initializeLetterStates() {
  letterStates = grid.map(row => 
    row.map(originalLetter => ({
      originalLetter,
      currentLetter: originalLetter,
      targetLetter: null,
      isRevealed: false
    }))
  );
}

// Create letter grid DOM
function createLetterGrid() {
  const gridContainer = document.getElementById('letterGrid');
  gridContainer.innerHTML = '';
  
  for (let row = 0; row < GRID_ROWS; row++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'letter-row';
    
    for (let col = 0; col < GRID_COLS; col++) {
      const cellDiv = document.createElement('div');
      cellDiv.className = 'letter-cell';
      cellDiv.id = `cell-${row}-${col}`;
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'letter-content hidden';
      contentDiv.textContent = grid[row][col];
      
      cellDiv.appendChild(contentDiv);
      rowDiv.appendChild(cellDiv);
    }
    
    gridContainer.appendChild(rowDiv);
  }
}

// Create ESP32 grid DOM
function createESP32Grid() {
  const esp32Container = document.getElementById('esp32Grid');
  esp32Container.innerHTML = '';
  
  messageSegments.forEach((segment, index) => {
    const boxDiv = document.createElement('div');
    boxDiv.className = 'esp32-box';
    boxDiv.id = `esp32-${index}`;
    
    boxDiv.innerHTML = `
      <div class="esp32-id">${segment.esp}</div>
      <div class="esp32-text">${segment.text}</div>
      <div class="esp32-status">
        <div class="esp32-indicator"></div>
        <span class="esp32-status-text">IDLE</span>
      </div>
      <div class="esp32-signal">
        <div class="signal-bar"></div>
        <div class="signal-bar"></div>
        <div class="signal-bar"></div>
        <div class="signal-bar"></div>
        <span class="signal-status">OFFLINE</span>
      </div>
    `;
    
    esp32Container.appendChild(boxDiv);
  });
}

// Start letter randomization
function startRandomization() {
  if (!isSystemActive) return;
  
  // Clear existing intervals
  randomizationIntervals.forEach(interval => clearInterval(interval));
  randomizationIntervals = [];
  
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (!letterStates[row][col].isRevealed) {
        const interval = setInterval(() => {
          if (!isSystemActive || letterStates[row][col].isRevealed) {
            clearInterval(interval);
            return;
          }
          
          const newLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
          letterStates[row][col].currentLetter = newLetter;
          
          const cellContent = document.querySelector(`#cell-${row}-${col} .letter-content`);
          if (cellContent && !letterStates[row][col].isRevealed) {
            cellContent.textContent = newLetter;
            cellContent.classList.add('randomizing');
          }
        }, 100 + Math.random() * 200);
        
        randomizationIntervals.push(interval);
      }
    }
  }
}

// Stop letter randomization
function stopRandomization() {
  randomizationIntervals.forEach(interval => clearInterval(interval));
  randomizationIntervals = [];
  
  // Remove randomizing classes
  document.querySelectorAll('.letter-content.randomizing').forEach(el => {
    el.classList.remove('randomizing');
  });
  
  // Reset to original letters for non-revealed cells
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (!letterStates[row][col].isRevealed) {
        letterStates[row][col].currentLetter = letterStates[row][col].originalLetter;
        const cellContent = document.querySelector(`#cell-${row}-${col} .letter-content`);
        if (cellContent) {
          cellContent.textContent = letterStates[row][col].originalLetter;
        }
      }
    }
  }
}

// Reveal letter path
function revealPath(segment, startDelay = 0) {
  segment.path.forEach((pos, index) => {
    setTimeout(() => {
      const state = letterStates[pos.row][pos.col];
      state.targetLetter = segment.text[index];
      state.isRevealed = true;
      
      const cell = document.getElementById(`cell-${pos.row}-${pos.col}`);
      const content = cell.querySelector('.letter-content');
      
      // Add flip-out animation
      content.classList.add('flipping-out');
      
      setTimeout(() => {
        // Change to target letter and color
        content.textContent = state.targetLetter;
        content.classList.remove('hidden', 'flipping-out', 'randomizing');
        content.classList.add('revealed', 'flipping-in');
        
        // Add glow effects
        const mainGlow = document.createElement('div');
        mainGlow.className = 'letter-glow main-glow';
        cell.appendChild(mainGlow);
        
        const flashGlow = document.createElement('div');
        flashGlow.className = 'letter-glow flash-glow';
        cell.appendChild(flashGlow);
        
        // Remove glow effects after animation
        setTimeout(() => {
          if (mainGlow.parentNode) mainGlow.remove();
          if (flashGlow.parentNode) flashGlow.remove();
        }, 1500);
        
      }, 300);
      
    }, startDelay + index * 150);
  });
}

// Create connection path
function createConnectionPath(segment, index) {
  const svg = document.getElementById('connectionPaths');
  const firstPath = segment.path[0];
  
  const espPosition = {
    x: 100 + (index % 4) * 300,
    y: window.innerHeight - 140 - Math.floor(index / 4) * 90
  };
  
  const gridPosition = {
    x: 40 + firstPath.col * 30,
    y: 153 + firstPath.row * 32
  };
  
  const midX = (espPosition.x + gridPosition.x) / 2;
  const midY = espPosition.y - 50;
  
  const pathData = `M ${espPosition.x} ${espPosition.y} Q ${midX} ${midY} ${gridPosition.x} ${gridPosition.y}`;
  
  // Create path element
  const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathElement.setAttribute('d', pathData);
  pathElement.className = 'connection-path active';
  pathElement.id = `path-${index}`;
  
  svg.appendChild(pathElement);
  
  // Create animated data packets
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const packet = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      packet.setAttribute('r', '4');
      packet.setAttribute('fill', '#47ff66');
      packet.className = 'data-packet';
      
      const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
      animateMotion.setAttribute('dur', '2s');
      animateMotion.setAttribute('path', pathData);
      animateMotion.setAttribute('begin', '0s');
      
      packet.appendChild(animateMotion);
      svg.appendChild(packet);
      
      // Remove packet after animation
      setTimeout(() => {
        if (packet.parentNode) packet.remove();
      }, 2000);
      
    }, i * 500);
  }
  
  // Remove path after animation
  setTimeout(() => {
    if (pathElement.parentNode) pathElement.remove();
  }, 7000);
}

// Update ESP32 status
function updateESP32Status(index, status) {
  const esp32Box = document.getElementById(`esp32-${index}`);
  const indicator = esp32Box.querySelector('.esp32-indicator');
  const statusText = esp32Box.querySelector('.esp32-status-text');
  const signalStatus = esp32Box.querySelector('.signal-status');
  
  esp32Box.classList.remove('active', 'completed');
  indicator.classList.remove('active', 'completed');
  
  switch (status) {
    case 'active':
      esp32Box.classList.add('active');
      indicator.classList.add('active');
      statusText.textContent = 'TX...';
      signalStatus.textContent = 'ONLINE';
      break;
    case 'completed':
      esp32Box.classList.add('completed');
      indicator.classList.add('completed');
      statusText.textContent = 'SENT';
      signalStatus.textContent = 'DONE';
      break;
    default:
      statusText.textContent = 'IDLE';
      signalStatus.textContent = 'OFFLINE';
  }
}

// Update status message
function updateStatusMessage(message, isComplete = false) {
  const statusMessage = document.getElementById('statusMessage');
  const statusIcon = document.querySelector('.status-icon');
  const statusText = document.querySelector('.status-text');
  
  statusMessage.classList.add('fade-out');
  
  setTimeout(() => {
    statusMessage.textContent = message;
    statusMessage.classList.remove('fade-out');
    statusMessage.classList.add('fade-in');
    
    if (isComplete) {
      statusIcon.classList.add('complete');
      statusText.classList.add('complete');
    } else {
      statusIcon.classList.remove('complete');
      statusText.classList.remove('complete');
    }
    
    setTimeout(() => {
      statusMessage.classList.remove('fade-in');
    }, 300);
  }, 150);
}

// Start message chain
function startMessageChain() {
  if (isProcessing) return;
  
  isProcessing = true;
  currentSegment = 0;
  isComplete = false;
  
  // Reset button
  const restartButton = document.getElementById('restartButton');
  const restartButtonText = document.getElementById('restartButtonText');
  restartButton.disabled = true;
  restartButtonText.textContent = 'Procesando...';
  
  // Reset states
  initializeLetterStates();
  createLetterGrid();
  
  // Clear final message
  const finalMessageContent = document.getElementById('finalMessageContent');
  finalMessageContent.classList.remove('visible');
  document.getElementById('finalMessageText').textContent = '';
  
  // Reset ESP32 statuses
  messageSegments.forEach((_, index) => updateESP32Status(index, 'idle'));
  
  // Clear connection paths
  document.getElementById('connectionPaths').innerHTML = '';
  
  // Process each segment
  messageSegments.forEach((segment, index) => {
    const delay = index * 2000;
    
    setTimeout(() => {
      currentSegment = index;
      updateStatusMessage(`PROCESANDO SEGMENTO ${index + 1}...`);
      updateESP32Status(index, 'active');
      
      // Create connection path
      createConnectionPath(segment, index);
      
      // Reveal path after a delay
      setTimeout(() => {
        revealPath(segment, 500);
        
        // Mark as completed after path is revealed
        setTimeout(() => {
          updateESP32Status(index, 'completed');
        }, segment.path.length * 150 + 1000);
        
      }, 200);
      
    }, delay);
  });
  
  // Complete the process
  setTimeout(() => {
    isComplete = true;
    isProcessing = false;
    isSystemActive = false;
    
    stopRandomization();
    updateStatusMessage('MENSAJE RECIBIDO', true);
    
    // Show final message
    const finalMessage = messageSegments.map(s => s.text).join(' ');
    document.getElementById('finalMessageText').textContent = finalMessage;
    
    setTimeout(() => {
      finalMessageContent.classList.add('visible');
    }, 500);
    
    // Reset button
    restartButton.disabled = false;
    restartButtonText.textContent = 'Reiniciar';
    
  }, messageSegments.length * 2000 + 1000);
}

// Initialize application
function initializeApp() {
  grid = generateGrid();
  initializeLetterStates();
  createLetterGrid();
  createESP32Grid();
  
  // Setup restart button
  document.getElementById('restartButton').addEventListener('click', () => {
    if (!isProcessing) {
      isSystemActive = true;
      startRandomization();
      
      setTimeout(() => {
        startMessageChain();
      }, 500);
    }
  });
  
  // Auto-start sequence
  setTimeout(() => {
    isSystemActive = true;
    startRandomization();
    
    setTimeout(() => {
      startMessageChain();
    }, 2000);
  }, 1000);
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);