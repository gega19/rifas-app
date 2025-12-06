# 🚀 Guía de Despliegue del Backoffice en Render

Esta guía te ayudará a desplegar el backoffice de la aplicación de rifas en **Render**.

---

## 📋 Prerrequisitos

- ✅ Cuenta en [Render](https://render.com)
- ✅ Código del proyecto subido a GitHub
- ✅ URL del backend desplegado (Railway o Vercel)

---

## 🎯 Pasos para Desplegar

### Paso 1: Obtener la URL del Backend

1. Ve a tu servicio del backend en Railway (o Vercel)
2. Copia la URL pública (ej: `https://tu-backend.railway.app`)
3. Guárdala para el siguiente paso

### Paso 2: Crear Servicio en Render

1. **Inicia sesión en Render:**
   - Ve a [render.com](https://render.com)
   - Inicia sesión con tu cuenta de GitHub

2. **Crear nuevo servicio:**
   - Click en **"New +"** → **"Static Site"**
   - Selecciona **"Build and deploy from a Git repository"**
   - Conecta tu repositorio de GitHub: `gega19/rifas-app`

### Paso 3: Configurar el Servicio

1. **Configuración básica:**
   - **Name:** `rifas-backoffice` (o el nombre que prefieras)
   - **Branch:** `main`
   - **Root Directory:** `rifas-backoffice` ⚠️ **IMPORTANTE**

2. **Configuración de Build:**
   - **Build Command:** `npm install && npm run build` ⚠️ **IMPORTANTE: Debe estar configurado**
   - **Publish Directory:** `dist` ⚠️ **IMPORTANTE: Debe estar configurado**
   
   **Nota:** Si el build command está vacío, Render no ejecutará el build y fallará. Asegúrate de que esté configurado.

### Paso 4: Configurar Variables de Entorno

1. En la sección **"Environment Variables"**, agrega:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** La URL de tu backend (ej: `https://tu-backend.railway.app`)
   - Click en **"Add Environment Variable"**

### Paso 5: Desplegar

1. Click en **"Create Static Site"**
2. Render comenzará a construir y desplegar tu proyecto
3. Espera a que termine el proceso (puede tardar 3-5 minutos)

### Paso 6: Verificar el Despliegue

1. Render te dará una URL como: `https://rifas-backoffice.onrender.com`
2. Abre la URL en el navegador
3. Deberías ver la página de login del backoffice

### Paso 7: Configurar Dominio Personalizado (Opcional)

1. En el servicio, ve a **"Settings"** → **"Custom Domains"**
2. Agrega tu dominio personalizado si lo deseas

---

## 🔧 Configuración Avanzada

### Usar render.yaml (Opcional)

Si prefieres usar el archivo `render.yaml` incluido:

1. En Render, al crear el servicio, selecciona **"Apply Render YAML"**
2. Render usará automáticamente la configuración del archivo

### Variables de Entorno Adicionales

Si necesitas más variables de entorno:

1. Ve a **"Environment"** en tu servicio
2. Agrega las variables necesarias:
   - `VITE_API_BASE_URL` (requerida)
   - Cualquier otra variable que necesite tu aplicación

---

## 📝 Checklist

- [ ] URL del backend copiada
- [ ] Servicio creado en Render
- [ ] Root Directory configurado como `rifas-backoffice`
- [ ] Build Command configurado: `npm install && npm run build`
- [ ] Publish Directory configurado: `dist`
- [ ] Variable `VITE_API_BASE_URL` configurada con la URL del backend
- [ ] Despliegue completado
- [ ] Aplicación funcionando correctamente

---

## 🔍 Troubleshooting

### Error: "Build failed"
- Verifica que el Root Directory sea `rifas-backoffice`
- Revisa los logs de build para ver el error específico

### Error: "Cannot find module"
- Asegúrate de que todas las dependencias estén en `package.json`
- Verifica que el build command incluya `npm install`

### Error: "API connection failed"
- Verifica que `VITE_API_BASE_URL` esté configurada correctamente
- Asegúrate de que el backend esté funcionando y accesible
- Verifica que el backend tenga CORS configurado para permitir requests desde Render

### Error: "404 on routes"
- Render está configurado para servir archivos estáticos
- El archivo `render.yaml` incluye la configuración necesaria
- Si tienes problemas, verifica que el Publish Directory sea `dist`

---

## 🔄 Actualizar CORS en el Backend

Si el backend tiene CORS restrictivo, agrega la URL de Render:

1. En Railway (o donde esté el backend), ve a **"Variables"**
2. Agrega o actualiza:
   - `BACKOFFICE_URL` = `https://rifas-backoffice.onrender.com`
   - `NODE_ENV` = `production`

---

## 📚 Recursos Adicionales

- [Render Docs](https://render.com/docs)
- [Render Static Sites](https://render.com/docs/static-sites)

---

¿Necesitas ayuda con algo más? ¡Déjame saber!

