import { useEffect, useState, useRef } from 'react';
import { Header } from './components/Header';
import { StatusIndicator } from './components/StatusIndicator';
import { FinalMessage } from './components/FinalMessage';

export default function App() {
  // State management
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [statusMessage, setStatusMessage] = useState('ESPERANDO MENSAJE');
  const [finalMessage, setFinalMessage] = useState('');
  const [showFinalMessage, setShowFinalMessage] = useState(false);

  // Refs for DOM manipulation
  const letterGridRef = useRef<HTMLDivElement>(null);

  // Application state
  const gridRef = useRef<string[][]>([]);
  const letterStatesRef = useRef<any[][]>([]);
  const randomizationIntervalsRef = useRef<NodeJS.Timeout[]>([]);

  // Constants
  const GRID_ROWS = 20;
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
    },
    {
      esp: "ESP32-13",
      text: "CON",
      path: [
        { row: 12, col: 20 }, { row: 12, col: 21 }, { row: 12, col: 22 }
      ]
    },
    {
      esp: "ESP32-14",
      text: "MULTIPLES",
      path: [
        { row: 13, col: 15 }, { row: 13, col: 16 }, { row: 13, col: 17 }, { row: 13, col: 18 },
        { row: 13, col: 19 }, { row: 13, col: 20 }, { row: 13, col: 21 }, { row: 13, col: 22 }, 
        { row: 13, col: 23 }
      ]
    },
    {
      esp: "ESP32-15",
      text: "DISPOSITIVOS",
      path: [
        { row: 14, col: 8 }, { row: 14, col: 9 }, { row: 14, col: 10 }, { row: 14, col: 11 },
        { row: 14, col: 12 }, { row: 14, col: 13 }, { row: 14, col: 14 }, { row: 14, col: 15 },
        { row: 14, col: 16 }, { row: 14, col: 17 }, { row: 14, col: 18 }, { row: 14, col: 19 }
      ]
    },
    {
      esp: "ESP32-16",
      text: "CONECTADOS",
      path: [
        { row: 15, col: 25 }, { row: 15, col: 26 }, { row: 15, col: 27 }, { row: 15, col: 28 },
        { row: 15, col: 29 }, { row: 15, col: 30 }, { row: 15, col: 31 }, { row: 15, col: 32 },
        { row: 15, col: 33 }, { row: 15, col: 34 }
      ]
    },
    {
      esp: "ESP32-17",
      text: "CREANDO",
      path: [
        { row: 16, col: 12 }, { row: 16, col: 13 }, { row: 16, col: 14 }, { row: 16, col: 15 },
        { row: 16, col: 16 }, { row: 16, col: 17 }, { row: 16, col: 18 }
      ]
    },
    {
      esp: "ESP32-18",
      text: "NARRATIVAS",
      path: [
        { row: 17, col: 18 }, { row: 17, col: 19 }, { row: 17, col: 20 }, { row: 17, col: 21 },
        { row: 17, col: 22 }, { row: 17, col: 23 }, { row: 17, col: 24 }, { row: 17, col: 25 },
        { row: 17, col: 26 }, { row: 17, col: 27 }
      ]
    },
    {
      esp: "ESP32-19",
      text: "EMERGENTES",
      path: [
        { row: 18, col: 6 }, { row: 18, col: 7 }, { row: 18, col: 8 }, { row: 18, col: 9 },
        { row: 18, col: 10 }, { row: 18, col: 11 }, { row: 18, col: 12 }, { row: 18, col: 13 },
        { row: 18, col: 14 }, { row: 18, col: 15 }
      ]
    },
    {
      esp: "ESP32-20",
      text: "DINAMICAS",
      path: [
        { row: 19, col: 28 }, { row: 19, col: 29 }, { row: 19, col: 30 }, { row: 19, col: 31 },
        { row: 19, col: 32 }, { row: 19, col: 33 }, { row: 19, col: 34 }, { row: 19, col: 35 }, 
        { row: 19, col: 36 }
      ]
    }
  ];

  // Generate initial grid
  const generateGrid = () => {
    const newGrid = [];
    for (let i = 0; i < GRID_ROWS; i++) {
      const row = [];
      for (let j = 0; j < GRID_COLS; j++) {
        row.push(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
      }
      newGrid.push(row);
    }
    return newGrid;
  };

  // Initialize letter states
  const initializeLetterStates = () => {
    letterStatesRef.current = gridRef.current.map(row => 
      row.map(originalLetter => ({
        originalLetter,
        currentLetter: originalLetter,
        targetLetter: null,
        isRevealed: false
      }))
    );
  };

  // Create letter grid DOM
  const createLetterGrid = () => {
    if (!letterGridRef.current) return;
    
    letterGridRef.current.innerHTML = '';
    
    for (let row = 0; row < GRID_ROWS; row++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'flex items-center justify-start leading-none';
      
      for (let col = 0; col < GRID_COLS; col++) {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'letter-cell';
        cellDiv.id = `cell-${row}-${col}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'letter-content';
        contentDiv.textContent = gridRef.current[row][col];
        
        cellDiv.appendChild(contentDiv);
        rowDiv.appendChild(cellDiv);
      }
      
      letterGridRef.current.appendChild(rowDiv);
    }
  };

  // Start letter randomization
  const startRandomization = () => {
    if (!isSystemActive) return;
    
    // Clear existing intervals
    randomizationIntervalsRef.current.forEach(interval => clearInterval(interval));
    randomizationIntervalsRef.current = [];
    
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (!letterStatesRef.current[row][col].isRevealed) {
          const interval = setInterval(() => {
            if (!isSystemActive || letterStatesRef.current[row][col].isRevealed) {
              clearInterval(interval);
              return;
            }
            
            const newLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
            letterStatesRef.current[row][col].currentLetter = newLetter;
            
            const cellContent = document.querySelector(`#cell-${row}-${col} div`);
            if (cellContent && !letterStatesRef.current[row][col].isRevealed) {
              cellContent.textContent = newLetter;
              cellContent.classList.add('letter-randomizing');
            }
          }, 100 + Math.random() * 200);
          
          randomizationIntervalsRef.current.push(interval);
        }
      }
    }
  };

  // Stop letter randomization
  const stopRandomization = () => {
    randomizationIntervalsRef.current.forEach(interval => clearInterval(interval));
    randomizationIntervalsRef.current = [];
    
    // Reset to original letters for non-revealed cells
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (!letterStatesRef.current[row][col].isRevealed) {
          letterStatesRef.current[row][col].currentLetter = letterStatesRef.current[row][col].originalLetter;
          const cellContent = document.querySelector(`#cell-${row}-${col} div`);
          if (cellContent) {
            cellContent.textContent = letterStatesRef.current[row][col].originalLetter;
            cellContent.classList.remove('letter-randomizing');
          }
        }
      }
    }
  };

  // Reveal letter path
  const revealPath = (segment: any, startDelay = 0) => {
    segment.path.forEach((pos: any, index: number) => {
      setTimeout(() => {
        const state = letterStatesRef.current[pos.row][pos.col];
        state.targetLetter = segment.text[index];
        state.isRevealed = true;
        
        const cell = document.getElementById(`cell-${pos.row}-${pos.col}`);
        const content = cell?.querySelector('div');
        
        if (content) {
          // Add flip-out animation
          content.style.transform = 'rotateX(90deg)';
          
          setTimeout(() => {
            // Change to target letter and add revealed class
            content.textContent = state.targetLetter;
            content.classList.add('letter-revealed');
            content.style.transform = 'rotateX(-90deg)';
            content.style.animation = 'flipIn 0.6s ease forwards';
            
            // Add glow effects
            const mainGlow = document.createElement('div');
            mainGlow.style.position = 'absolute';
            mainGlow.style.inset = '0';
            mainGlow.style.borderRadius = '50%';
            mainGlow.style.pointerEvents = 'none';
            mainGlow.style.zIndex = '-1';
            mainGlow.style.backgroundColor = '#47ff66';
            mainGlow.style.filter = 'blur(16px)';
            mainGlow.style.animation = 'mainGlow 1.5s ease-out forwards';
            cell?.appendChild(mainGlow);
            
            // Remove glow effects after animation
            setTimeout(() => {
              if (mainGlow.parentNode) mainGlow.remove();
            }, 1500);
            
          }, 300);
        }
        
      }, startDelay + index * 150);
    });
  };



  // Start message chain
  const startMessageChain = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setCurrentSegment(0);
    setIsComplete(false);
    setFinalMessage('');
    setShowFinalMessage(false);
    
    // Reset states
    initializeLetterStates();
    createLetterGrid();
    
    // Process each segment
    messageSegments.forEach((segment, index) => {
      const delay = index * 2000;
      
      setTimeout(() => {
        setCurrentSegment(index);
        setStatusMessage(`PROCESANDO SEGMENTO ${index + 1}...`);
        
        // Reveal path after a delay
        setTimeout(() => {
          revealPath(segment, 500);
        }, 200);
        
      }, delay);
    });
    
    // Complete the process
    setTimeout(() => {
      setIsComplete(true);
      setIsProcessing(false);
      setIsSystemActive(false);
      
      stopRandomization();
      setStatusMessage('MENSAJE RECIBIDO');
      
      // Show final message
      const finalMsg = messageSegments.map(s => s.text).join(' ');
      setFinalMessage(finalMsg);
      
      setTimeout(() => {
        setShowFinalMessage(true);
      }, 500);
      
    }, messageSegments.length * 2000 + 1000);
  };



  // Initialize application
  useEffect(() => {
    gridRef.current = generateGrid();
    initializeLetterStates();
    createLetterGrid();

    // CSS animations are now defined in globals.css
    
    // Auto-start sequence
    setTimeout(() => {
      setIsSystemActive(true);
      startRandomization();
      
      setTimeout(() => {
        startMessageChain();
      }, 2000);
    }, 1000);

    return () => {
      randomizationIntervalsRef.current.forEach(interval => clearInterval(interval));
    };
  }, []);



  return (
    <div className="bg-black text-white min-h-screen relative overflow-hidden font-mono">
      <Header />
      
      <StatusIndicator 
        isProcessing={isProcessing}
        isComplete={isComplete}
        statusMessage={statusMessage}
      />

      {/* Letter Grid */}
      <div 
        ref={letterGridRef}
        className="absolute top-[140px] left-10 w-[1354px]"
      />

      <FinalMessage 
        finalMessage={finalMessage}
        showFinalMessage={showFinalMessage}
      />
    </div>
  );
}