#!/usr/bin/env python3
"""
Servidor WebSocket para recibir mensajes del ESP32 y enviarlos al sitio web.
Este servidor actúa como intermediario entre el ESP32 y el navegador.
"""

import asyncio
import websockets
import json
import logging
from datetime import datetime
from typing import Set

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuración del servidor
HOST = 'localhost'
PORT = 8765
ESP32_PORT = 8766  # Puerto separado para el ESP32

# Conjuntos para mantener las conexiones activas
web_clients: Set[websockets.WebSocketServerProtocol] = set()
esp32_clients: Set[websockets.WebSocketServerProtocol] = set()


async def handle_web_client(websocket, path):
    """Maneja conexiones desde el navegador web"""
    web_clients.add(websocket)
    client_ip = websocket.remote_address[0] if websocket.remote_address else "unknown"
    logger.info(f"Cliente web conectado desde {client_ip}")
    
    try:
        # Enviar mensaje de bienvenida
        welcome_message = {
            "type": "connected",
            "message": "Conectado al servidor. Esperando historia del ESP32...",
            "timestamp": datetime.now().isoformat()
        }
        await websocket.send(json.dumps(welcome_message))
        
        # Mantener la conexión activa
        async for message in websocket:
            logger.info(f"Mensaje recibido del cliente web: {message}")
            # Los clientes web en este caso solo reciben, no envían
            
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Cliente web {client_ip} desconectado")
    except Exception as e:
        logger.error(f"Error con cliente web {client_ip}: {e}")
    finally:
        web_clients.discard(websocket)


async def handle_esp32_client(websocket, path):
    """Maneja conexiones desde el ESP32"""
    esp32_clients.add(websocket)
    client_ip = websocket.remote_address[0] if websocket.remote_address else "unknown"
    logger.info(f"ESP32 conectado desde {client_ip}")
    
    try:
        # Confirmar conexión al ESP32
        confirmation = {
            "type": "esp32_connected",
            "message": "ESP32 conectado al servidor",
            "timestamp": datetime.now().isoformat()
        }
        await websocket.send(json.dumps(confirmation))
        
        # Escuchar mensajes del ESP32
        async for message in websocket:
            logger.info(f"Historia recibida del ESP32: {message}")
            await broadcast_story_to_web_clients(message)
            
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"ESP32 {client_ip} desconectado")
    except Exception as e:
        logger.error(f"Error con ESP32 {client_ip}: {e}")
    finally:
        esp32_clients.discard(websocket)


async def broadcast_story_to_web_clients(story_data):
    """Envía la historia a todos los clientes web conectados"""
    if not web_clients:
        logger.warning("No hay clientes web conectados para enviar la historia")
        return
    
    try:
        # Intentar parsear como JSON
        story_json = json.loads(story_data)
        message_to_send = story_data
    except json.JSONDecodeError:
        # Si no es JSON, crear un mensaje estructurado
        message_to_send = json.dumps({
            "type": "final_story",
            "message": story_data,
            "timestamp": datetime.now().isoformat(),
            "source": "ESP32"
        })
    
    # Enviar a todos los clientes web
    disconnected_clients = set()
    for client in web_clients:
        try:
            await client.send(message_to_send)
            logger.info(f"Historia enviada a cliente web {client.remote_address[0]}")
        except websockets.exceptions.ConnectionClosed:
            disconnected_clients.add(client)
        except Exception as e:
            logger.error(f"Error enviando a cliente web: {e}")
            disconnected_clients.add(client)
    
    # Limpiar clientes desconectados
    web_clients -= disconnected_clients


async def simulate_esp32_story():
    """Función para simular mensajes del ESP32 (solo para pruebas)"""
    await asyncio.sleep(5)  # Esperar 5 segundos
    
    sample_stories = [
        "Había una vez un robot que soñaba con ser humano, pero entonces apareció un gato cibernético que, sin embargo, la historia tomó un giro extraño cuando y ese es el final de esta historia.",
        "En un laboratorio secreto, los estudiantes crearon un ESP32 mágico, luego algo inesperado sucedió, y de repente todo cambió cuando descubrieron que tenían poderes, y ese es el final de esta historia.",
        "El cadáver exquisito robótico comenzó a escribir, pero entonces los microcontroladores cobraron vida propia, sin embargo, decidieron colaborar en armonía, y ese es el final de esta historia."
    ]
    
    import random
    story = random.choice(sample_stories)
    
    if web_clients:
        await broadcast_story_to_web_clients(story)
        logger.info("Historia simulada enviada")


async def start_servers():
    """Inicia ambos servidores WebSocket"""
    logger.info("Iniciando servidores WebSocket...")
    
    # Servidor para clientes web
    web_server = websockets.serve(handle_web_client, HOST, PORT)
    logger.info(f"Servidor web iniciado en ws://{HOST}:{PORT}")
    
    # Servidor para ESP32
    esp32_server = websockets.serve(handle_esp32_client, HOST, ESP32_PORT)
    logger.info(f"Servidor ESP32 iniciado en ws://{HOST}:{ESP32_PORT}")
    
    # Ejecutar ambos servidores
    await asyncio.gather(
        web_server,
        esp32_server
    )


def main():
    """Función principal"""
    print("🤖 Servidor WebSocket - Cadáver Exquisito Robótico")
    print(f"📡 Servidor web: ws://{HOST}:{PORT}")
    print(f"🔌 Servidor ESP32: ws://{HOST}:{ESP32_PORT}")
    print("⚡ Presiona Ctrl+C para detener el servidor")
    print("-" * 50)
    
    try:
        # Crear el loop de eventos
        loop = asyncio.get_event_loop()
        
        # Opcional: programar simulación de historia después de un tiempo
        # loop.create_task(simulate_esp32_story())
        
        # Ejecutar los servidores
        loop.run_until_complete(start_servers())
        loop.run_forever()
        
    except KeyboardInterrupt:
        logger.info("Servidor detenido por el usuario")
    except Exception as e:
        logger.error(f"Error en el servidor: {e}")
    finally:
        print("\n👋 ¡Servidor detenido!")


if __name__ == "__main__":
    main()
