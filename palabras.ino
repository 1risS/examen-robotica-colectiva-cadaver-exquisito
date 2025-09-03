#define MAX_PALABRAS 10
String vectorPalabras[MAX_PALABRAS];  //
int cantPalabras = 0;
String texto = "Este es el texto";
void setup() {
  Serial.begin(9600);

  cantPalabras = split(texto, ' ');
  Serial.print("Cant Palabras: ");
  Serial.println(cantPalabras);
  ///Ver Resultado--------------------
  for (int j = 0; j < cantPalabras; ++j) {
    Serial.println(vectorPalabras[j]);
  }
}

void loop() {
  delay(1000);
}


int split(String _texto, char _c) {
  String palabra = "";
  int contador = 0;

  for (int i = 0; i < _texto.length(); ++i) {
    if (contador < MAX_PALABRAS) {
      char caracter = _texto[i];
      if (caracter != _c) {
        palabra += caracter;
      } else {
        vectorPalabras[contador] = palabra;
        palabra = "";
        contador++;
      }
    }
  }
  if (!palabra.equals(""))
    if (contador < MAX_PALABRAS) {
      vectorPalabras[contador] = palabra;
      contador++;
    }
  return contador;
}
