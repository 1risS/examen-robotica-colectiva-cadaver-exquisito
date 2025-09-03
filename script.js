// Variables globales
let websocket
let connectionAttempts = 0
const maxConnectionAttempts = 5

// Configuración del WebSocket del servidor Python
const SERVER_HOST = 'localhost'
const SERVER_PORT = 8765

// Elementos del DOM
const finalStoryDiv = document.getElementById('finalStory')
const connectionStatusSpan = document.getElementById('connectionStatus')
const statusMessageP = document.getElementById('statusMessage')
const storyTimestampSpan = document.getElementById('storyTimestamp')

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function () {
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
      updateStatusMessage(
        'Conectado al servidor. Esperando historia del ESP32...'
      )
    }

    websocket.onmessage = function (event) {
      console.log('Mensaje recibido:', event.data)
      handleReceivedMessage(event.data)
    }

    websocket.onclose = function (event) {
      console.log('Conexión WebSocket cerrada')
      updateConnectionStatus('disconnected')

      if (connectionAttempts < maxConnectionAttempts) {
        connectionAttempts++
        updateStatusMessage(
          `Reconectando... (${connectionAttempts}/${maxConnectionAttempts})`
        )
        setTimeout(initializeWebSocket, 3000)
      } else {
        updateStatusMessage(
          'No se pudo conectar al servidor. ¿Está ejecutándose?'
        )
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

// Inicializar conexión WebSocket
function initializeWebSocket () {
  try {
    updateConnectionStatus('connecting')
    websocket = new WebSocket(`ws://${ESP32_IP}:${ESP32_PORT}/`)

    websocket.onopen = function (event) {
      console.log('Conexión WebSocket establecida')
      updateConnectionStatus('connected')
      connectionAttempts = 0
      showStatus('Conectado al ESP32', 'success')
    }

    websocket.onmessage = function (event) {
      console.log('Mensaje recibido del ESP32:', event.data)
      handleReceivedMessage(event.data)
    }

    websocket.onclose = function (event) {
      console.log('Conexión WebSocket cerrada')
      updateConnectionStatus('disconnected')

      if (connectionAttempts < maxConnectionAttempts) {
        connectionAttempts++
        showStatus(
          `Reconectando... (${connectionAttempts}/${maxConnectionAttempts})`,
          'info'
        )
        setTimeout(initializeWebSocket, 3000)
      } else {
        showStatus(
          'No se pudo conectar al ESP32. Verifica que esté encendido y conectado.',
          'error'
        )
      }
    }

    websocket.onerror = function (error) {
      console.error('Error de WebSocket:', error)
      showStatus('Error de conexión con el ESP32', 'error')
    }
  } catch (error) {
    console.error('Error al crear WebSocket:', error)
    updateConnectionStatus('disconnected')
    showStatus('Error al conectar con el ESP32', 'error')
  }
}

// Actualizar estado de conexión en la UI
function updateConnectionStatus (status) {
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
  statusMessageP.textContent = message
}

// Manejar mensajes recibidos del servidor
function handleReceivedMessage (data) {
  try {
    // Intentar parsear como JSON primero
    const messageData = JSON.parse(data)

    if (messageData.type === 'final_story') {
      displayFinalStory(messageData.message, messageData.timestamp)
      updateStatusMessage('¡Historia completa recibida! 🎉')
    } else {
      console.log('Tipo de mensaje desconocido:', messageData)
    }
  } catch (error) {
    // Si no es JSON, tratar como mensaje directo
    displayFinalStory(data)
    updateStatusMessage('¡Historia completa recibida! 🎉')
  }
}

// Mostrar la historia final
function displayFinalStory (story, timestamp = null) {
  finalStoryDiv.textContent = story
  finalStoryDiv.className = 'story-text'

  // Mostrar timestamp si está disponible
  if (timestamp) {
    const date = new Date(timestamp)
    storyTimestampSpan.textContent = `Recibida: ${date.toLocaleString()}`
  } else {
    storyTimestampSpan.textContent = `Recibida: ${new Date().toLocaleString()}`
  }

  // Scroll automático hacia la historia
  finalStoryDiv.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  })
}

// Limpiar la historia
function clearStory () {
  finalStoryDiv.textContent = 'Esperando la historia colaborativa...'
  finalStoryDiv.className = 'story-text empty'
  storyTimestampSpan.textContent = ''
  updateStatusMessage('Historia limpiada. Esperando nueva historia...')
}

// Función para reconectar manualmente
function reconnect () {
  initializeWebSocket()
}

// Eventos del teclado
document.addEventListener('keydown', function (event) {
  // F5 para reconectar
  if (event.key === 'F5' && event.ctrlKey) {
    event.preventDefault()
    reconnect()
  }

  // Escape para limpiar
  if (event.key === 'Escape') {
    clearStory()
  }
})

// Funciones de debugging
window.debugWebSocket = {
  reconnect: reconnect,
  clear: clearStory,
  status: () => (websocket ? websocket.readyState : 'No WebSocket'),
  simulate: message => handleReceivedMessage(message)
}

// Mostrar mensajes de estado
function showStatus (message, type) {
  sendStatusDiv.textContent = message
  sendStatusDiv.className = `status ${type}`

  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    sendStatusDiv.textContent = ''
    sendStatusDiv.className = 'status'
  }, 5000)
}

// Enviar mensaje inicial al ESP32
function sendInitialMessage () {
  const message = initialMessageInput.value.trim()

  if (!message) {
    showStatus('Por favor, escribe un mensaje antes de enviarlo.', 'error')
    return
  }

  if (!websocket || websocket.readyState !== WebSocket.OPEN) {
    showStatus(
      'No hay conexión con el ESP32. Intentando reconectar...',
      'error'
    )
    initializeWebSocket()
    return
  }

  try {
    // Enviar mensaje al ESP32
    websocket.send(
      JSON.stringify({
        type: 'initial_message',
        message: message,
        timestamp: new Date().toISOString()
      })
    )

    showStatus('Mensaje enviado al primer ESP32 ✨', 'success')
    initialMessageInput.value = ''

    // Activar progreso visual
    updateProgress(1)

    // Mostrar mensaje de espera
    finalStoryDiv.textContent =
      'Historia enviada... esperando que los ESP32s completen la cadena...'
    finalStoryDiv.className = 'story-text empty'
  } catch (error) {
    console.error('Error al enviar mensaje:', error)
    showStatus('Error al enviar el mensaje', 'error')
  }
}

// Manejar mensajes recibidos del ESP32
function handleReceivedMessage (data) {
  try {
    const messageData = JSON.parse(data)

    switch (messageData.type) {
      case 'final_story':
        displayFinalStory(messageData.message)
        updateProgress(4)
        showStatus('¡Historia completa recibida! 🎉', 'success')
        break

      case 'progress_update':
        updateProgress(messageData.step)
        showStatus(`ESP32 ${messageData.step} procesando...`, 'info')
        break

      case 'error':
        showStatus(`Error en ESP32: ${messageData.message}`, 'error')
        break

      default:
        console.log('Tipo de mensaje desconocido:', messageData)
    }
  } catch (error) {
    console.error('Error al procesar mensaje:', error)
    // Si no es JSON, tratarlo como mensaje directo
    displayFinalStory(data)
    updateProgress(4)
    showStatus('¡Historia completa recibida! 🎉', 'success')
  }
}

// Mostrar la historia final
function displayFinalStory (story) {
  finalStoryDiv.textContent = story
  finalStoryDiv.className = 'story-text'

  // Scroll automático hacia la historia
  finalStoryDiv.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  })
}

// Actualizar progreso visual
function updateProgress (currentStep) {
  // Resetear todos los pasos
  for (let i = 1; i <= 4; i++) {
    const stepElement = document.getElementById(`step${i}`)
    stepElement.classList.remove('active', 'completed')

    if (i < currentStep) {
      stepElement.classList.add('completed')
    } else if (i === currentStep) {
      stepElement.classList.add('active')
    }
  }
}

// Función para reiniciar el proceso
function resetProcess () {
  finalStoryDiv.textContent = 'Esperando la historia final...'
  finalStoryDiv.className = 'story-text empty'

  // Resetear progreso
  updateProgress(0)

  initialMessageInput.value = ''
  sendStatusDiv.textContent = ''
  sendStatusDiv.className = 'status'
}

// Función de utilidad para validar conexión
function checkConnection () {
  if (!websocket || websocket.readyState !== WebSocket.OPEN) {
    showStatus('Conexión perdida. Intentando reconectar...', 'error')
    initializeWebSocket()
    return false
  }
  return true
}

// Eventos del teclado globales
document.addEventListener('keydown', function (event) {
  // F5 para reconectar
  if (event.key === 'F5' && event.ctrlKey) {
    event.preventDefault()
    initializeWebSocket()
  }

  // Escape para resetear
  if (event.key === 'Escape') {
    resetProcess()
  }
})

// Debugging en consola
window.debugESP32 = {
  reconnect: initializeWebSocket,
  reset: resetProcess,
  send: sendInitialMessage,
  status: () => (websocket ? websocket.readyState : 'No WebSocket')
}
