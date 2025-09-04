// Variables globales
let websocket
let connectionAttempts = 0
const maxConnectionAttempts = 5

// Configuración del WebSocket del servidor Python
const SERVER_HOST = '192.168.0.107' // IP de tu Mac
const SERVER_PORT = 8765

// Elementos del DOM
const finalStoryDiv = document.getElementById('finalStory')
const connectionStatusSpan = document.getElementById('connectionStatus')
const statusMessageP = document.getElementById('statusMessage')
const storyTimestampSpan = document.getElementById('storyTimestamp')

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function () {
  console.log('Página cargada, iniciando conexión WebSocket...')
  initializeWebSocket()
})

// Inicializar conexión WebSocket
function initializeWebSocket () {
  try {
    updateConnectionStatus('connecting')
    websocket = new WebSocket(`ws://${SERVER_HOST}:${SERVER_PORT}`)

    websocket.onopen = function (event) {
      console.log('Conexión WebSocket establecida con el servidor')
      updateConnectionStatus('connected')
      connectionAttempts = 0
      updateStatusMessage('Conectado al servidor. Esperando historia del ESP32...')
    }

    websocket.onmessage = function (event) {
      console.log('Mensaje recibido del servidor:', event.data)
      handleReceivedMessage(event.data)
    }

    websocket.onclose = function (event) {
      console.log('Conexión WebSocket cerrada')
      updateConnectionStatus('disconnected')

      if (connectionAttempts < maxConnectionAttempts) {
        connectionAttempts++
        updateStatusMessage(`Reconectando... (${connectionAttempts}/${maxConnectionAttempts})`)
        setTimeout(initializeWebSocket, 3000)
      } else {
        updateStatusMessage('No se pudo conectar al servidor. ¿Está ejecutándose?')
      }
    }

    websocket.onerror = function (error) {
      console.error('Error de WebSocket:', error)
      updateStatusMessage('Error de conexión con el servidor')
    }
  } catch (error) {
    console.error('Error al crear WebSocket:', error)
    updateConnectionStatus('disconnected')
    updateStatusMessage('Error al conectar con el servidor')
  }
}

// Actualizar estado de conexión en la UI
function updateConnectionStatus (status) {
  if (!connectionStatusSpan) return
  
  connectionStatusSpan.className = `status-${status}`

  switch (status) {
    case 'connected':
      connectionStatusSpan.textContent = '🟢 Conectado'
      break
    case 'connecting':
      connectionStatusSpan.textContent = '🟡 Conectando...'
      break
    case 'disconnected':
      connectionStatusSpan.textContent = '🔴 Desconectado'
      break
  }
}

// Actualizar mensaje de estado
function updateStatusMessage (message) {
  if (!statusMessageP) return
  statusMessageP.textContent = message
  console.log('Estado:', message)
}

// Manejar mensajes recibidos del servidor
function handleReceivedMessage (data) {
  try {
    // Intentar parsear como JSON primero
    const messageData = JSON.parse(data)
    console.log('Datos parseados:', messageData)

    if (messageData.type === 'final_story') {
      console.log('Historia final recibida:', messageData.message)
      displayFinalStory(messageData.message, messageData.timestamp)
      updateStatusMessage('¡Historia completa recibida! 🎉')
    } else if (messageData.type === 'connected') {
      console.log('Mensaje de bienvenida recibido')
      updateStatusMessage(messageData.message)
    } else {
      console.log('Tipo de mensaje desconocido:', messageData)
    }
  } catch (error) {
    console.error('Error al parsear JSON, tratando como texto:', error)
    // Si no es JSON, tratar como mensaje directo
    displayFinalStory(data)
    updateStatusMessage('¡Historia completa recibida! 🎉')
  }
}

// Mostrar la historia final
function displayFinalStory (story, timestamp = null) {
  if (!finalStoryDiv) {
    console.error('Elemento finalStory no encontrado')
    return
  }

  console.log('Mostrando historia:', story)
  finalStoryDiv.textContent = story
  finalStoryDiv.className = 'story-text'

  // Mostrar timestamp si está disponible
  if (storyTimestampSpan) {
    if (timestamp) {
      const date = new Date(timestamp)
      storyTimestampSpan.textContent = `Recibida: ${date.toLocaleString()}`
    } else {
      storyTimestampSpan.textContent = `Recibida: ${new Date().toLocaleString()}`
    }
  }

  // Scroll automático hacia la historia
  finalStoryDiv.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  })
}

// Limpiar la historia
function clearStory () {
  if (finalStoryDiv) {
    finalStoryDiv.textContent = 'Esperando la historia colaborativa...'
    finalStoryDiv.className = 'story-text empty'
  }
  if (storyTimestampSpan) {
    storyTimestampSpan.textContent = ''
  }
  updateStatusMessage('Historia limpiada. Esperando nueva historia...')
}

// Función para reconectar manualmente
function reconnect () {
  console.log('Reconectando manualmente...')
  connectionAttempts = 0
  initializeWebSocket()
}

// Eventos del teclado
document.addEventListener('keydown', function (event) {
  // F5 + Ctrl para reconectar
  if (event.key === 'F5' && event.ctrlKey) {
    event.preventDefault()
    reconnect()
  }

  // Escape para limpiar
  if (event.key === 'Escape') {
    clearStory()
  }
})

// Funciones de debugging para la consola
window.debugWebSocket = {
  reconnect: reconnect,
  clear: clearStory,
  status: () => websocket ? websocket.readyState : 'No WebSocket',
  simulate: (message) => handleReceivedMessage(message),
  testMessage: () => handleReceivedMessage('{"type":"final_story","message":"Mensaje de prueba desde la consola","timestamp":"2024-01-01T00:00:00.000Z"}')
}

console.log('Script cargado. Funciones de debug disponibles en window.debugWebSocket')
