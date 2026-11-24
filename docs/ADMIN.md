# Administración del inventario

Estado: implementación en rama de trabajo. No está activada en la tienda de producción. La tienda mantiene el catálogo publicado de seis sables hasta conectar y verificar la base de datos.

## Qué hace

- Acceso en `/admin` mediante correo y contraseña; no hay registro público.
- Edición manual de las unidades físicas y de la opción «Sobre pedido» al agotarse.
- Atajos «Vendí 1 unidad» y «Vendí 1 combo» que preparan el descuento de 1 o 2 unidades. Solo se publica al pulsar Guardar cambios.
- Historial de cambios con usuario, fecha, cantidad anterior, cantidad nueva y motivo.
- Control de versión: si otra persona modificó el producto, se rechaza el guardado obsoleto.
- El escaparate consulta el inventario persistido en cada carga y no almacena el HTML en caché. Si la base no responde, muestra disponibilidad a confirmar.
- No reserva unidades, no descuenta al abrir WhatsApp y no registra una venta automáticamente. El equipo registra las ventas confirmadas.

## Activación pendiente

1. Autorizar al conector de Vercel para administrar el equipo `juanma-jove`. La integración GitHub → Vercel ya funciona y es independiente de ese permiso.
2. Verificar el plan de hosting de la tienda comercial. No se contrató ningún servicio de pago con este cambio.
3. Crear/conectar PostgreSQL (por ejemplo Neon mediante Vercel Marketplace). Usar una base independiente en Preview; nunca compartir las credenciales de producción con una rama de prueba.
4. Configurar variables privadas: `DATABASE_URL`, `BETTER_AUTH_SECRET` (aleatorio, mínimo 32 caracteres), `BETTER_AUTH_URL` (origen exacto HTTPS de la tienda) e `INVENTORY_MODE=database`. Ninguna credencial va al HTML ni al código público.
5. En una terminal de confianza, cargar esas variables en `.env.local` y ejecutar `npm run admin:setup`. Crea las tablas de autenticación e inventario. Si un producto ya tiene inventario, no sobrescribe su cantidad con el JSON del repositorio.
6. Crear cada cuenta autorizada ejecutando `npm run admin:setup -- --create-admin` con `ADMIN_EMAIL`, `ADMIN_NAME` y `ADMIN_INITIAL_PASSWORD` disponibles únicamente en esa terminal. La contraseña debe tener al menos 12 caracteres; eliminar las variables iniciales después. No enviar contraseñas por chat ni guardarlas en GitHub. Cada persona recibe su propia cuenta y puede cambiar la contraseña desde el panel.
7. Revisar en Preview: login, edición, conflicto de dos sesiones, logout, stock en el escaparate y carrito. Después incorporar esta rama a `main`, configurar exclusivamente el entorno Production y verificar la URL pública.

Para revocar acceso, quitar el usuario de `admin_members` y revocar sus sesiones. El permiso de administración se consulta en cada petición; no depende de una marca en el navegador.

## Diseño técnico

Una Vercel Function recibe los endpoints de autenticación/inventario y genera el inicio y fichas con el stock actual. Better Auth gestiona el hash de contraseña, sesiones, cookies y límites de intentos; PostgreSQL conserva usuarios, inventario e historial. El registro y los cambios de identidad no se exponen. Las escrituras verifican sesión, pertenencia a `admin_members`, origen exacto y formato; la actualización y el movimiento se guardan en la misma sentencia SQL.

El límite de login es compartido (5 intentos por minuto), persistido en la base de datos, y no confía en cabeceras IP enviadas por el visitante. Es apropiado para este panel pequeño; antes de ampliar el equipo puede configurarse una cabecera de IP verificada por la plataforma.

`data/catalogo.json` sigue siendo la fuente de títulos, precios, fotos y descripciones. Una vez activado el panel, la cantidad y «Sobre pedido» vienen de PostgreSQL. Para agregar un nuevo producto, actualizar el JSON y ejecutar de nuevo la preparación del inventario. El editor local no actualiza la base.

## Validación

`npm ci`, `npm run check`, `npm run build`, `npm test`.

Las pruebas ejecutan autenticación real en SQLite y las sentencias de inventario en PostgreSQL mediante PGlite: acceso anónimo, usuario sin permiso, registro público deshabilitado, origen inválido, cantidades inválidas, conflicto de versiones, historial, stock renderizado, fallo de base, cierre de sesión y límite de intentos.

La validación real en Vercel con base y cuentas de producción sigue pendiente. No debe confundirse un Preview sin credenciales con un panel activado.
