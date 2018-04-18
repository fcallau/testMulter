#TRYURAPP API

1. Debe arrancarse el servidor de MongoDB desde el directorio que se instaló: _bin/mongod --dbpath ./data/db --directoryperdb_

2. Debe arrancarse el cliente de MongoDB desde el directorio que se instaló: _./bin/mongo_

3. Finalmente debe arrancarse la aplicación desde el directorio donde fue descargada la aplicación: _nodemon_

* * *

**¿Cómo probar la API?**

Desde Postman, con las siguientes configuraciones iniciales:

- En la pestaña **Headers** crear los pares clave / valor:

		Content_type	application/x-www-form-urlencoded
		language		en

- Para los métodos GET, la url a usar es la ruta raíz (http://localhost:5407/api/) seguida del endpoint y los posibles parámetros que puedan usarse (añadidos a continuación).

- Para los métodos POST, la url a usar es la ruta raíz (http://localhost:5407/api/) seguida del endpoint y en el **Body** se informan los posibles parámetros que puedan usarse.

* * *

Documentación de la API en doc/index.html