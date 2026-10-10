# Verificación de la versión inicial

## Recuperación del 9 de octubre de 2026

- Código recuperado de `Dharma_tienda_inicial.zip`, manteniendo el diseño, catálogo, fotografías y funcionamiento de la versión entregada.
- Repositorio identificado: `jdejuanma/DharmaCollection`, rama `main`. Antes de la recuperación, solo contenía `package.json` en el commit `888b709b3e8982d795ad1cdbc27a60bd4daf7646`.
- En esta sesión se ejecutaron `npm run check`, `npm test` y `npm run build`: sintaxis correcta, siete pruebas aprobadas y seis páginas generadas.
- El registro de pruebas visuales del 6 de octubre se conserva debajo como antecedente; no representa una nueva prueba del sitio publicado.
- Pendiente: conectar el repositorio a Vercel y comprobar el despliegue. El conector devuelve falta de autorización para el espacio `juanma-jove`; el navegador requiere iniciar sesión.

## Registro de la entrega del 6 de octubre de 2026

Verificación local documentada en el archivo original:

- Compilación de seis páginas completada.
- Comprobación de sintaxis y siete pruebas automatizadas del catálogo y carrito aprobadas.
- Revisión en Chromium con anchos de 320, 390, 768 y 1440 píxeles, sin desbordamiento horizontal.
- Fotografías y recursos cargados correctamente; sin errores de JavaScript ni solicitudes fallidas durante el recorrido comprobado.
- Búsqueda, filtros de disponibilidad, reinicio de filtros y menú móvil comprobados.
- Spinner limitado a una unidad; Peso Pesado disponible para consulta por encargo. Comprobados subtotal, persistencia del carrito al recargar y eliminación de productos.
- Verificados el número de WhatsApp y el mensaje generado con subtotal, entrega y costos pendientes de confirmación. No se envió ningún mensaje ni se efectuó un pedido.
- Fichas individuales, información de envíos/pagos y privacidad comprobadas. Datos estructurados del Spinner en PYG verificados.
- Vista previa HTML autónoma comprobada, incluyendo apertura de detalles y carrito.
- Editor local comprobado creando un producto de prueba, incorporando una foto y descargando un catálogo con sus datos. El producto de prueba no se incorporó al catálogo comercial.

## Pendiente de publicación

La comprobación anterior corresponde al entorno local. Quedan por verificar el despliegue real en Vercel, el dominio y HTTPS, las condiciones del plan comercial, los metadatos con la URL definitiva y el recorrido desde un teléfono con WhatsApp. El repositorio remoto existe; la publicación de Dharma en Vercel sigue pendiente.

El catálogo tiene stock manual. Esta versión no sincroniza ventas externas, no reserva unidades, no procesa pagos y no guarda pedidos en una base de datos.

## Revisión de identidad y contacto

- Contacto actualizado a +595 982 102453 en catálogo, consultas, encargos y carrito. Comprobado que no queden enlaces con el número anterior en los archivos de publicación.
- Botón de contacto: **Escribinos al WhatsApp**, sin número visible.
- Menú centrado en escritorio independientemente del logo; márgenes ampliados y logo más a la izquierda.
- Paleta del manual aplicada, con base blanca y títulos azules.
- Logotipo original con TAN Headline; títulos web en DM Serif Display y textos en Manrope, con fuentes locales.
- Nueva revisión visual y funcional en 320, 390, 768 y 1440 píxeles, sin errores de consola ni desbordamientos.
- En la entrega original no se había completado el acceso a GitHub. Ese estado quedó superado con la identificación del repositorio remoto indicada arriba. El error de autorización del conector de Vercel sigue pendiente de resolver.
- La entrega original informaba un plan Hobby; el plan actual no se ha confirmado. Antes de lanzar un sitio comercial, revisar un plan compatible o elegir otro hosting. Referencia: https://vercel.com/docs/plans/hobby.
