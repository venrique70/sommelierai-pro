# SommelierPro AI

Aplicación web que funciona como sommelier de vinos y licores (Next.js 14 + Firebase + Genkit/Gemini).

## Requisitos

- Node.js 20 o superior

## Puesta en marcha

```bash
npm install
# crea un archivo .env.local con las variables de la sección siguiente
npm run dev                  # http://localhost:3000
```

Otros comandos: `npm run build`, `npm start`, `npm run lint`.

## Variables de entorno (`.env.local`, no se sube a git)

Cliente (Firebase): `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`,
`NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`,
`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`.

Servidor: `GEMINI_API_KEY` (o `GOOGLE_API_KEY`) y credenciales de Firebase Admin
(`FIREBASE_SERVICE_ACCOUNT`). Nunca subas llaves privadas al repositorio.
