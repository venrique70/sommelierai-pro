# Guía para probar SommelierPro AI en tu computador

## 1. Preparar (una sola vez)
Requisitos: Node.js 20 o superior y Git.

```powershell
git clone https://github.com/venrique70/sommelierai-pro
cd sommelierai-pro
npm install
copy .env.example .env.local
```
Abre `.env.local` y rellena los valores (`.env.example` explica cada variable).

Mínimo para ver la app y poder iniciar sesión: las seis variables `NEXT_PUBLIC_FIREBASE_*`.
- Para funciones que usan la base de datos desde el servidor (historial, bodega, panel de administración): credenciales de **Firebase Admin** (opción A o B del ejemplo).
- Para el análisis, las recomendaciones y los maridajes con IA: `GEMINI_API_KEY`.
- Sin Firebase Admin, las rutas protegidas del servidor responderán 401.

## 2. Ejecutar
```powershell
npm run dev
```
Abre http://localhost:3000

## 3. Qué probar (anota qué falla y qué mensaje sale)
1. **Registro e inicio de sesión**: con correo/contraseña y con Google.
2. **Analizar vino** (pestaña principal): escribe un vino, analiza y revisa que aparezca el resultado.
3. **Recomendar vino** y **Cena/Maridaje**.
4. **Historial**: el análisis anterior debe aparecer; abre uno.
5. **Mi bodega**: agrega un vino desde un análisis.
6. **Cuenta / planes**: que se muestre el plan y los contadores de uso.
7. **Panel de administración** (solo tu correo de `ADMIN_EMAILS`, verificado): vendedores y cuentas corporativas.
8. **Idioma**: cambia entre español e inglés.

## 4. Comandos útiles
- `npm run build` : compila como en producción.
- `npm run lint` : revisa el código.

No subas `.env.local` a git y no pegues llaves en chats.
