#!/usr/bin/env python3
"""
Script de prueba para simular un ESP32 enviando historias al servidor.
Úsalo para probar el sitio web sin necesidad del ESP32 real.
"""

import asyncio
import websockets
import json
import time
from datetime import datetime

# Configuración
SERVER_HOST = 'localhost'
ESP32_PORT = 8766

# Historias de prueba
SAMPLE_STORIES = [
    "Había una vez un robot que soñaba con ser humano, pero entonces apareció un gato cibernético que cambió todo, sin embargo, la historia tomó un giro extraño cuando descubrieron la verdad, y ese es el final de esta historia.",
    
    "En un laboratorio de la facultad, los estudiantes crearon un ESP32 mágico, luego algo inesperado sucedió con los sensores, y de repente todo cambió cuando los microcontroladores cobraron vida, y ese es el final de esta historia.",
    
    "El proyecto de robótica colectiva comenzó como un experimento, pero entonces los robots empezaron a comunicarse entre sí, sin embargo, decidieron colaborar para crear arte digital, y ese es el final de esta historia.",
    
    "Un día cualquiera en la clase de programación, los ESP32s se rebelaron contra sus creadores, luego formaron una red de comunicación secreta, y finalmente descubrieron que su propósito era crear historias colaborativas, y ese es el final de esta historia.",
    
    "En el mundo de los microcontroladores, existía una leyenda sobre el cadáver exquisito digital, pero nadie sabía cómo funcionaba hasta que cuatro ESP32s se unieron, sin embargo, su colaboración superó todas las expectativas, y ese es el final de esta historia."
]

async def simulate_esp32():
    """Simula un ESP32 enviando historias al servidor"""
    print("🤖 Simulador ESP32 - Cadáver Exquisito")
    print(f"🔌 Conectando a ws://{SERVER_HOST}:{ESP32_PORT}")
    
    try:
        async with websockets.connect(f"ws://{SERVER_HOST}:{ESP32_PORT}") as websocket:
            print("✅ Conectado al servidor como ESP32")
            
            # Esperar confirmación del servidor
            response = await websocket.recv()
            print(f"📨 Servidor: {response}")
            
            # Enviar historias cada cierto tiempo
            for i, story in enumerate(SAMPLE_STORIES, 1):
                print(f"\n📝 Enviando historia {i}/{len(SAMPLE_STORIES)}...")
                print(f"Historia: {story[:50]}...")
                
                # Enviar como JSON estructurado
                message = {
                    "type": "final_story",
                    "message": story,
                    "timestamp": datetime.now().isoformat(),
                    "esp32_id": "ESP32_FINAL",
                    "story_number": i
                }
                
                await websocket.send(json.dumps(message))
                print("✅ Historia enviada")
                
                # Esperar antes de enviar la siguiente
                if i < len(SAMPLE_STORIES):
                    wait_time = 10
                    print(f"⏱️  Esperando {wait_time} segundos antes de la siguiente historia...")
                    await asyncio.sleep(wait_time)
            
            print("\n🎉 Todas las historias enviadas!")
            print("💬 El simulador seguirá activo. Presiona Ctrl+C para salir.")
            
            # Mantener la conexión activa
            try:
                await websocket.wait_closed()
            except KeyboardInterrupt:
                print("\n👋 Simulador detenido por el usuario")
                
    except ConnectionRefusedError:
        print("❌ No se pudo conectar al servidor.")
        print(f"   Asegúrate de que websocket_server.py esté ejecutándose.")
    except Exception as e:
        print(f"❌ Error: {e}")

async def send_single_story():
    """Envía una sola historia para prueba rápida"""
    print("⚡ Enviando historia de prueba rápida...")
    
    try:
        async with websockets.connect(f"ws://{SERVER_HOST}:{ESP32_PORT}") as websocket:
            story = SAMPLE_STORIES[0]
            message = {
                "type": "final_story",
                "message": story,
                "timestamp": datetime.now().isoformat(),
                "esp32_id": "ESP32_TEST"
            }
            
            await websocket.send(json.dumps(message))
            print("✅ Historia de prueba enviada!")
            
    except Exception as e:
        print(f"❌ Error enviando historia: {e}")

def main():
    """Función principal con menú de opciones"""
    print("🚀 Simulador ESP32 para Cadáver Exquisito")
    print("=" * 40)
    print("1. Enviar historias automáticamente (cada 10 segundos)")
    print("2. Enviar una historia de prueba")
    print("3. Salir")
    
    try:
        opcion = input("\nElige una opción (1-3): ").strip()
        
        if opcion == "1":
            asyncio.run(simulate_esp32())
        elif opcion == "2":
            asyncio.run(send_single_story())
        elif opcion == "3":
            print("👋 ¡Hasta luego!")
        else:
            print("❌ Opción no válida")
            
    except KeyboardInterrupt:
        print("\n👋 ¡Hasta luego!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
