\# RO MVP Timer



Implementación completa de la solución RO MVP Timer con backend en AWS SAM y frontend Angular unificado.



\## Prerrequisitos



\- Node.js 20+

\- npm 10+

\- AWS CLI configurado

\- SAM CLI



\## Backend



1\. Instalar dependencias:

&nbsp;  ```bash

&nbsp;  cd backend

&nbsp;  npm install

&nbsp;  ```

2\. Ejecutar pruebas:

&nbsp;  ```bash

&nbsp;  npm test

&nbsp;  ```

&nbsp;  - Si aparece un prompt para instalar Jest, asegúrate de haber ejecutado antes `npm install` en esta carpeta para evitar instalaciones ad-hoc.

3\. Compilar para despliegue:

&nbsp;  ```bash

&nbsp;  npm run build

&nbsp;  ```



\## Frontend



1\. Instalar dependencias:

&nbsp;  ```bash

&nbsp;  cd frontend

&nbsp;  npm install

&nbsp;  ```

2\. Compilar la aplicación:

&nbsp;  ```bash

&nbsp;  npm run build

&nbsp;  ```

&nbsp;  - Los artefactos se generan en `dist/mvp-app`.



3\. Subir contenido a S3 (ajustar variables reales):

&nbsp;  ```bash

&nbsp;  aws s3 sync dist/mvp-app s3://<bucket>/

&nbsp;  ```



4\. Configurar `window.__env` en el `index.html` con valores reales de API y Cognito.



\## Infraestructura (SAM)



1\. Desde la carpeta `infra` ejecutar:

&nbsp;  ```bash

&nbsp;  sam build

&nbsp;  sam deploy --guided

&nbsp;  ```



2\. Proporcionar los parámetros solicitados (dominios de retorno Cognito, etc.).



3\. Tras el despliegue actualizar los `index.html` con las URLs de CloudFront, API y Cognito.



\## Estructura de Lambdas



\- `lists-read`: Recupera listas propias y compartidas.

\- `lists-write`: Crea nuevas listas y otorga rol owner.

\- `list-share`: Gestiona invitaciones y compartidos.

\- `timers-read`: Consulta timers por lista.

\- `timers-write`: Marca muertes y actualiza TTL.

\- `mvp-catalog`: Lista catálogo de MVPs.

\- `ragnapi-sync`: Sincroniza catálogo desde RagnaPI (requiere rol admin).

\- `post-confirmation-trigger`: Maneja altas de usuarios e invitaciones.

\- `timers-ttl-stream`: Receptor vacío para expiraciones TTL.



\## Pruebas



Las pruebas unitarias verifican el cálculo de ventanas de respawn y la lógica básica de autorización.



\## Notas



\- Asegurarse de definir dominios válidos de Cognito para los callbacks.



