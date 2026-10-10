# Dharma Collection

Versión revisada el 6 de octubre de 2026: catálogo, fichas de producto, categorías, búsqueda, filtros, carrito y coordinación por WhatsApp. La estructura se adaptó del proyecto Fastysport con la identidad, el logo y las fotos de Dharma.

## Probar la tienda

Requiere Node.js 22 o posterior. No necesita instalar dependencias.

```sh
npm run dev
```

Abrir http://localhost:4173. Para preparar los archivos de publicación y comprobar el código:

```sh
npm run check
npm test
npm run build
```

La carpeta `dist/` contiene el sitio generado. No se edita directamente. `node scripts/export-preview.mjs` crea una vista portátil en un único HTML, para revisar el diseño y probar el carrito sin un servidor. Los enlaces a WhatsApp y redes requieren internet.

## Catálogo inicial

| Producto | Precio | Stock inicial | Sin stock |
| --- | ---: | ---: | --- |
| Cinturón World Spinner | 399.000 Gs. | 1 | Consulta por encargo |
| Cinturón Peso Pesado Championship | 399.000 Gs. de referencia | 0 | Consulta por encargo |

Ambos son talla pequeña, modelo único, categoría Cinturones WWE. Las cantidades se cargaron con los datos suministrados; deben revisarse antes de lanzar y después de cada venta. Un encargo requiere confirmar precio y plazo por WhatsApp. No hay descuentos automáticos.

## Añadir productos y actualizar stock

1. Ejecutar `npm run build` y abrir `herramientas/editor-catalogo.html` en el navegador. Es una herramienta local; no se publica con la tienda.
2. Para continuar una edición anterior, importar el archivo actual `data/catalogo.json`.
3. Seleccionar un producto o pulsar **Agregar producto**. Completar nombre, descripción corta, categoría, precio en guaraníes sin separadores, stock, talla, variante, identificador, características y texto descriptivo de la foto.
4. Subir una foto JPG, PNG o WebP. Se conserva el encuadre completo y se reduce a un máximo de 1.200 píxeles. La foto se incluye en el catálogo exportado.
5. Descargar `catalogo.json`, reemplazar `data/catalogo.json` y comprobar el resultado con `npm run build`.
6. Cuando GitHub y Vercel estén vinculados, guardar ese cambio en la rama de producción para actualizar la tienda.

Descargar los cambios antes de cerrar el editor. El editor no guarda automáticamente ni modifica un sitio publicado. Mantener estable el identificador de un producto existente para conservar sus enlaces. Las imágenes WebP que utiliza la tienda se guardan en `assets/products/`. Las dos fotografías PNG originales de alta resolución se conservan en el respaldo `Dharma_tienda_inicial.zip`; no son necesarias para compilar o publicar la tienda.

El stock **se actualiza manualmente**: el carrito limita cantidades según el catálogo cargado, pero no reserva unidades ni descuenta existencias. Confirmar disponibilidad al responder cada consulta y publicar el stock nuevo después de una venta. Si un producto tiene stock 0, desaparece el botón para agregarlo al carrito y aparece la consulta de encargo/disponibilidad.

## Compra, entregas y pagos

- WhatsApp: +595 982 102453. El carrito prepara un mensaje con productos, cantidades, subtotal y tipo de entrega. El comprador decide enviarlo desde WhatsApp.
- Delivery en Asunción y Gran Asunción; encomiendas al resto del país. Costo y plazo de envío a cotizar.
- Agenda de 7:00 a 12:00 y entregas por la tarde. Los pedidos agendados por la tarde quedan para el día siguiente, con horario a confirmar.
- Retiro en la puerta del depósito en Asunción, coordinando ubicación y horario por WhatsApp.
- Delivery: efectivo o transferencia al recibir, coordinando con el repartidor. Encomienda: pago antes del envío. Retiro: pago a coordinar.

No hay cobros de tarjeta, registro de clientes, base de datos de pedidos ni panel administrativo en línea. La gestión inicial se hace por WhatsApp y con el editor local. Un clic hacia WhatsApp no acredita una compra ni un pago.

## GitHub y Vercel

El código fuente de esta tienda se conserva en el repositorio independiente [jdejuanma/DharmaCollection](https://github.com/jdejuanma/DharmaCollection), rama `main`. Fastysport es un proyecto separado.

1. Mantener esta carpeta como raíz del repositorio, conservando los archivos de configuración. No incluir `.env`, `dist/`, `node_modules/` ni archivos de credenciales.
2. En Vercel, importar ese repositorio. Verificar que el plan de la cuenta permita uso comercial antes de lanzar.
3. Framework: **Other**. Build command: `npm run build`. Output directory: `dist`. Node.js: una versión compatible con `>=22`. La configuración está en `vercel.json`.
4. Publicar primero una vista de prueba y revisar fotos, carrito, enlaces y precios en un teléfono.
5. Cuando se defina el dominio, configurar `SITE_URL` como origen HTTPS, por ejemplo `https://tu-dominio.py`, y volver a desplegar. No usar un dominio de ejemplo en producción. Si Vercel proporciona `VERCEL_PROJECT_PRODUCTION_URL`, la compilación de producción lo utiliza como alternativa.
6. Vincular el dominio y sus DNS siguiendo los valores del proyecto concreto de Vercel. No se han inventado registros DNS ni configurado un dominio.

Las vistas de Vercel con entorno `preview` incluyen `noindex` y bloquean el rastreo en `robots.txt`. La URL de producción genera etiquetas canónicas, Open Graph y sitemap. Las fichas con stock incluyen datos estructurados Product/Offer en PYG. Las fichas por encargo no declaran una oferta firme.

La aplicación no necesita base de datos ni una pasarela de pago para esta fase. Las condiciones y el costo del hosting dependen de la cuenta y del plan elegidos; no hay un servicio contratado desde este proyecto.

### Continuar el trabajo desde ChatGPT / Codex

1. Abrir este repositorio y revisar su versión actual antes de editar, aunque se continúe en otro chat.
2. Describir el cambio y aportar las fotos, textos o datos de catálogo que requiera.
3. Modificar los archivos fuente, ejecutar las comprobaciones anteriores y revisar las pantallas afectadas. Para cambios grandes, trabajar en una rama y revisar una vista previa antes de incorporarlos a `main`.
4. Guardar el cambio en GitHub. Una vez habilitada la integración de Vercel, los cambios en su rama de producción pueden generar un nuevo despliegue automáticamente.
5. Verificar que Vercel haya terminado el despliegue y comprobar la página publicada. Un commit guardado no garantiza que el despliegue haya tenido éxito.

No hace falta reconstruir la tienda para cambiar productos, precios, fotos o diseño. Pagos e inventario automático requieren una ampliación de la aplicación. El historial de Git permite recuperar versiones anteriores. Conservar la URL del repositorio y los accesos conectados; no depender de la memoria de un chat ni compartir contraseñas en él.

## Etapas siguientes

1. **Revisión inicial:** confirmar fotos, textos y stock; crear repositorio y vista de Vercel.
2. **Lanzamiento:** definir dominio, confirmar condiciones comerciales del hosting, probar una coordinación completa por WhatsApp y publicar.
3. **Operación:** actualizar existencias y añadir mercadería con el editor. Validar la experiencia antes de invertir los 250.000 Gs. previstos para publicidad.
4. **Administración en línea:** incorporar acceso seguro, base de datos para inventario y pedidos, historial y estados, cuando el volumen lo requiera.
5. **Pagos en línea:** seleccionar un proveedor compatible con el comercio y su cuenta habilitada; integrar confirmaciones de pago y conciliación. Requiere definir primero el proveedor y sus condiciones.

## Archivos principales

- `data/catalogo.json`: productos, precios, stock y contactos.
- `src/styles.css`: colores, tipografía y diseño adaptable.
- `scripts/site.mjs`: contenido y plantillas de páginas.
- `src/cart.mjs` y `src/app.mjs`: carrito, filtros e interacción.
- `src/editor.html` y `src/editor.mjs`: herramienta local de catálogo.
- `scripts/build.mjs`: compilación estática y validación del catálogo.
- `tests/cart.test.mjs`: integridad de cantidades, precios, datos y mensaje de WhatsApp.
- `vercel.json`: construcción, rutas y cabeceras de seguridad.

Antes de modificar el sitio, guardar una versión en Git. Ante un error de contenido, restaurar el catálogo anterior y volver a publicar. No almacenar contraseñas ni datos privados de clientes dentro del repositorio.

## Identidad visual aplicada

Se conservaron el logo original con TAN Headline y la paleta del manual: azul `#09276B`, gris `#5C6C7D` y blanco `#FFFFFF`. El encabezado usa un menú centrado de forma independiente, con logo a la izquierda y carrito a la derecha.

Para los textos web se combinan **DM Serif Display** (títulos) y **Manrope** (texto, botones y precios). Ambas fuentes están alojadas en el proyecto; sus licencias OFL se incluyen en `assets/fonts/`. El PDF contiene muestras de TAN Headline, no una fuente web completa. Para aplicarla exactamente a los títulos editables, incorporar su archivo web y autorización de uso correspondiente; el punto de cambio es `--font-display` en `src/styles.css`. El logotipo conserva su tipografía original.

El contacto actualizado es **+595 982 102453**. La llamada principal de la sección de consultas dice **Escribinos al WhatsApp** y todos los enlaces se generan desde `whatsapp` en `data/catalogo.json`.
