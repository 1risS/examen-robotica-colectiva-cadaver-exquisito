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
HOST = '0.0.0.0'  # Escuchar en todas las interfaces de red
PORT = 8765  # Un solo puerto para ESP32 y navegador

# Conjuntos para mantener las conexiones activas
web_clients: Set[websockets.WebSocketServerProtocol] = set()
esp32_clients: Set[websockets.WebSocketServerProtocol] = set()


async def handle_client(websocket):
    """Maneja conexiones tanto de navegador web como de ESP32"""
    global web_clients, esp32_clients  # Declarar variables globales
    
    client_ip = websocket.remote_address[0] if websocket.remote_address else "unknown"
    logger.info(f"Cliente conectado desde {client_ip}")
    
    # Asumir que es cliente web por defecto y enviar mensaje de bienvenida
    # Los ESP32 se identificarán cuando envíen su primer mensaje
    web_clients.add(websocket)
    logger.info(f"Cliente web agregado desde {client_ip}")
    
    try:
        # Enviar mensaje de bienvenida a clientes web
        welcome_message = {
            "type": "connected",
            "message": "Conectado al servidor. Esperando historia del ESP32...",
            "timestamp": datetime.now().isoformat()
        }
        await websocket.send(json.dumps(welcome_message))
        
        async for message in websocket:
            # Detectar si es ESP32 por el contenido del mensaje
            try:
                data = json.loads(message)
                if "message" in data and websocket.remote_address[0] != "192.168.0.107":
                    # Es un ESP32 enviando historia (no desde la Mac del servidor)
                    # Mover de web_clients a esp32_clients
                    web_clients.discard(websocket)
                    esp32_clients.add(websocket)
                    logger.info(f"ESP32 detectado desde {client_ip}, reclasificando")
                    
                    # Reenviar a todos los clientes web
                    await broadcast_story_to_web_clients(message)
                else:
                    # Es un mensaje de cliente web (probablemente ping/pong o error)
                    logger.info(f"Mensaje de cliente web desde {client_ip}: {message}")
                    
            except json.JSONDecodeError:
                # Es un cliente web enviando algo que no es JSON
                logger.info(f"Mensaje no JSON de cliente web desde {client_ip}: {message}")
                    
                    
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Cliente {client_ip} desconectado")
    except Exception as e:
        logger.error(f"Error con cliente {client_ip}: {e}")
    finally:
        web_clients.discard(websocket)
        esp32_clients.discard(websocket)


async def broadcast_story_to_web_clients(story_data):
    """Envía la historia a todos los clientes web conectados"""
    global web_clients  # Declarar como variable global
    
    if not web_clients:
        logger.warning("No hay clientes web conectados para enviar la historia")
        return
    
    try:
        # Parsear el JSON del ESP32
        story_json = json.loads(story_data)
        
        # Transformar al formato esperado por el navegador
        message_to_send = json.dumps({
            "type": "final_story",
            "message": story_json.get("message", story_data),
            "timestamp": datetime.now().isoformat(),
            "source": "ESP32"
        })
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
    """Inicia el servidor WebSocket unificado"""
    logger.info("Iniciando servidor WebSocket...")
    
    # Un solo servidor para ambos tipos de cliente
    async with websockets.serve(handle_client, HOST, PORT):
        logger.info(f"Servidor unificado iniciado en ws://{HOST}:{PORT}")
        await asyncio.Future()  # Ejecutar para siempre


def main():
    """Función principal"""
    print("🤖 Servidor WebSocket - Cadáver Exquisito Robótico")
    print(f"📡 Servidor unificado: ws://{HOST}:{PORT}")
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
