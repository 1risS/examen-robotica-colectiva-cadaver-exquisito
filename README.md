# 🤖 Cadáver Exquisito Robótico

Proyecto de robótica colectiva que permite crear historias colaborativas usando ESP32s conectados y un sitio web para mostrar el resultado final.

## 📁 Estructura del Proyecto

```
examen-robotica-colectiva-cadaver-exquisito/
├── index.html              # Sitio web para mostrar historias
├── style.css              # Estilos del sitio web
├── script.js              # Lógica JavaScript y WebSocket
├── websocket_server.py    # Servidor Python WebSocket
├── test_esp32_simulator.py # Simulador ESP32 para pruebas
├── requirements.txt       # Dependencias Python
├── microcontrolador.ino   # Código para ESP32 (opcional)
└── README.md             # Este archivo
```

## 🚀 Configuración y Uso

### 1. Instalar Dependencias Python

```bash
pip install -r requirements.txt
```

O instalar manualmente:
```bash
pip install websockets
```

### 2. Ejecutar el Servidor WebSocket

```bash
python websocket_server.py
```

El servidor iniciará en:
- **Puerto 8765**: Para el sitio web
- **Puerto 8766**: Para el ESP32

### 3. Abrir el Sitio Web

Abre `index.html` en tu navegador o usa el Simple Browser de VS Code.

### 4. Probar con el Simulador

En otra terminal, ejecuta:
```bash
python test_esp32_simulator.py
```

Elige la opción 1 para enviar historias automáticamente o la opción 2 para una prueba rápida.

## 🔧 Funcionamiento

### Flujo del Proyecto:
1. **Otra compañera** inicia la historia en su sitio web
2. La historia pasa por **ESP32 1** → **ESP32 de Lía** → **ESP32 3**
3. Cada ESP32 agrega su parte a la historia
4. **Tu ESP32** recibe la historia final y la envía al servidor Python
5. El **servidor Python** retransmite la historia a tu **sitio web**
6. El **sitio web** muestra la historia colaborativa completa

### Arquitectura:
```
ESP32 Final → Servidor Python WebSocket → Sitio Web
     ↓                    ↓                   ↓
  Puerto 8766         Servidor            Puerto 8765
```

## 🌐 Configuración del Sitio Web

El sitio web está configurado para:
- **Solo recibir** mensajes del ESP32 (no enviar)
- Conectarse automáticamente al servidor local
- Mostrar historias con timestamp
- Permitir limpiar la pantalla

### Controles:
- **F5 + Ctrl**: Reconectar al servidor
- **Escape**: Limpiar historia actual
- **Botón "Limpiar Historia"**: Resetear pantalla

## 🔌 Configuración del ESP32

Para conectar tu ESP32 real al servidor Python, modifica el código del ESP32:

```cpp
// En lugar de conectar directamente al sitio web
const char* websocket_server = "TU_IP_PC";  // IP de tu PC
const int websocket_port = 8766;            // Puerto del ESP32
```

## 🧪 Pruebas y Debug

### Usar el Simulador:
```bash
python test_esp32_simulator.py
```

### Debug en el Navegador:
Abre la consola del navegador y usa:
```javascript
// Ver estado de conexión
debugWebSocket.status()

// Reconectar manualmente
debugWebSocket.reconnect()

// Simular mensaje
debugWebSocket.simulate("Historia de prueba")

// Limpiar pantalla
debugWebSocket.clear()
```

## 🎨 Características del Sitio

- ✨ **Interfaz moderna** con gradientes y animaciones
- 📱 **Diseño responsivo** para móviles y desktop
- 🔄 **Reconexión automática** si se pierde la conexión
- ⏰ **Timestamps** para cada historia recibida
- 🧹 **Función de limpieza** para resetear la pantalla
- 🎯 **Estado de conexión** visual en tiempo real

## 🛠️ Solución de Problemas

### "No se pudo conectar al servidor"
1. Verifica que `websocket_server.py` esté ejecutándose
2. Revisa que no haya firewall bloqueando los puertos
3. Asegúrate de que las librerías Python están instaladas

### "WebSocket connection failed"
1. Verifica la URL del servidor en `script.js`
2. Comprueba que el puerto 8765 esté libre
3. Revisa la consola del navegador para más detalles

### El ESP32 no se conecta
1. Cambia la IP del servidor en el código del ESP32
2. Verifica que esté conectado a la misma red WiFi
3. Usa el puerto 8766 para ESP32, no el 8765

## 📝 Personalización

### Cambiar Mensajes:
Edita las historias en `test_esp32_simulator.py` en la variable `SAMPLE_STORIES`.

### Cambiar Puertos:
- Servidor web: `script.js` → `SERVER_PORT`
- ESP32: `websocket_server.py` → `ESP32_PORT`

### Cambiar Estilos:
Modifica `style.css` para personalizar colores, fuentes y animaciones.

## 👥 Colaboradores

Este proyecto fue creado para la clase de Robótica Colectiva de la facultad, como un ejemplo de comunicación colaborativa entre microcontroladores.

---
🤖 **¡Disfruta creando historias robóticas colaborativas!** ✨
