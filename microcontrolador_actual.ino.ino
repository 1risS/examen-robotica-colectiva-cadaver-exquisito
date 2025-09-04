#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>

// const char* ssid = "Telecentro-1b07";      // Reemplaza con el nombre de tu red WiFi
// const char* password = "MHYXTZ47XGCX";  // Reemplaza con la contraseña
const char *ssid = "MAIPU71TERCERPISO"; // Reemplaza con el nombre de tu red WiFi
const char *password = "universidad";   // Reemplaza con la contraseña
const char *wsHost = "192.168.0.107";   // Host del servidor WebSocket
const int wsPort = 8000;                // Puerto del servidor WebSocket
const char *wsPath = "/message";        // Ruta del servidor WebSocket (ajusta si es necesario)

WebServer server(80);       // Crear servidor web en puerto 80
WebSocketsClient webSocket; // Cliente WebSocket
String lastReceivedMessage = "";

void setup()
{
    Serial.begin(115200);
    delay(2000);
    Serial.println("Iniciando HW-466AB ESP32-C3...");

    // Conectar a WiFi
    WiFi.begin(ssid, password);
    Serial.print("Conectando a ");
    Serial.println(ssid);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20)
    {
        delay(1000);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println("");
        Serial.println("Conexión WiFi establecida!");
        Serial.print("Dirección IP del ESP: ");
        Serial.println(WiFi.localIP());

        // Configurar el servidor web para recibir mensajes (desde otro ESP32 vía HTTP)
        setupWebServer();

        // Configurar el cliente WebSocket
        webSocket.begin(wsHost, wsPort, wsPath);
        webSocket.setReconnectInterval(5000); // Intentar reconectar cada 5 segundos si se pierde la conexión
    }
    else
    {
        Serial.println("");
        Serial.println("Error: No se pudo conectar a WiFi");
        return;
    }

    // Enviar el mensaje inicial vía WebSocket
    sendMessage("¡Hola, empieza el cadáver exquisito!");
}

void loop()
{
    server.handleClient(); // Manejar peticiones del servidor web
    webSocket.loop();      // Manejar el cliente WebSocket

    // Solo enviar mensaje cada 10 segundos si no hemos recibido ninguno
    static unsigned long lastSent = 0;
    if (millis() - lastSent > 10000 && lastReceivedMessage == "")
    {
        sendMessage("¡Hola, empieza el cadáver exquisito!");
        lastSent = millis();
    }
}

void setupWebServer()
{
    // Endpoint para recibir mensajes del otro ESP32 (vía HTTP POST)
    server.on("/receive_message", HTTP_POST, []()
              {
    if (server.hasArg("plain")) {
      String body = server.arg("plain");
      Serial.println("Mensaje recibido del otro ESP32: " + body);
      
      // Parsear el JSON
      DynamicJsonDocument doc(1024);
      deserializeJson(doc, body);
      String receivedMessage = doc["message"];
      
      lastReceivedMessage = receivedMessage;
      Serial.println("Mensaje procesado: " + receivedMessage);
      
      // Agregar nuestro string al mensaje recibido
      String newMessage = receivedMessage + "y así termina esta historia!";
      
      // Enviar el mensaje modificado al sitio web vía WebSocket
      sendMessage(newMessage);
      
      // Responder al otro ESP32 que recibimos el mensaje
      server.send(200, "application/json", "{\"status\":\"received\"}");
    } else {
      server.send(400, "application/json", "{\"error\":\"no data\"}");
    } });

    // Endpoint para verificar que el servidor está funcionando
    server.on("/", HTTP_GET, []()
              { server.send(200, "text/plain", "ESP32 listo para recibir mensajes"); });

    server.begin();
    Serial.println("Servidor web ESP32 iniciado en puerto 80");
}

void sendMessage(String message)
{
    if (WiFi.status() == WL_CONNECTED)
    {
        if (webSocket.isConnected())
        {
            String json = "{\"message\":\"" + message + "\"}";
            Serial.println("Enviando mensaje vía WebSocket: " + json);
            webSocket.sendTXT(json);
        }
        else
        {
            Serial.println("WebSocket no conectado, intentando reconectar...");
        }
    }
    else
    {
        Serial.println("WiFi no conectado, intentando reconectar...");
        WiFi.reconnect();
    }
}
