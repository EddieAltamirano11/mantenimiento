# Contexto Técnico y Arquitectura del Proyecto

Este documento describe la estructura técnica, el stack de tecnologías y la metodología de trabajo empleada en el desarrollo del sistema.

## 1. Stack Tecnológico

El proyecto está construido bajo una arquitectura monolítica moderna, utilizando herramientas que permiten una integración fluida entre el backend y el frontend sin necesidad de construir una API REST tradicional.

* **Backend:** Laravel (PHP)
* **Frontend:** React.js
* **Comunicación / Enrutamiento:** Inertia.js
* **Base de Datos:** MariaDB / MySQL
* **Estilos:** Tailwind CSS
* **Componentes UI:** Shadcn UI + Radix UI (para accesibilidad)
* **Íconos:** Lucide React
* **Empaquetador de Módulos:** Vite

## 2. Metodología y Patrones de Trabajo

El flujo de trabajo técnico sigue lineamientos específicos para asegurar el rendimiento, la consistencia visual y la integridad de los datos:

* **Renderizado y Estado (Inertia.js):** Se prescinde de APIs (fetch/axios). El backend (Controladores) inyecta la información directamente como *props* a los componentes de React mediante `Inertia::render`. Los envíos de formularios utilizan el hook `useForm` de Inertia para manejar validaciones, estados de carga (`processing`) y envíos (`post`, `put`, `delete`).
* **Gestión de Base de Datos (Query Builder vs Eloquent):** Para optimizar consultas y mantener un control estricto sobre las estructuras, se utiliza el Query Builder de Laravel (`DB::table`) para las operaciones CRUD complejas, en lugar de depender enteramente del ORM Eloquent.
* **Integridad y Tipos de Datos:** 
    * Se utilizan **UUIDs** (Universal Unique Identifiers) como llaves primarias nativas por defecto en la base de datos en lugar de enteros autoincrementables.
    * Se aplican *Constraints* de tipo `CHECK` a nivel de base de datos para restringir valores exactos (ej. Estatus: 'Pendiente', 'Aceptada', 'Rechazada', 'Completada' y Roles: 'Solicitante', 'Encargado', 'Tecnico').
* **Diseño Modular (Componentización):** El frontend se divide estrictamente en componentes reutilizables (ej. Modales aislados como `CreateSolicitudModal`, `EditSolicitudModal`) que reciben su estado mediante *props* desde vistas principales que actúan como contenedores (`Index.jsx`).

## 3. Estructura de Directorios Principal

La organización de los archivos clave del proyecto se distribuye de la siguiente manera:

```text
/
├── app/
│   └── Http/
│       └── Controllers/        # Lógica de negocio, consultas (DB::table) y respuestas
├── routes/
│   └── web.php                 # Rutas protegidas (auth) y de recursos (Route::resource)
├── resources/
│   └── js/
│       ├── Components/         # Componentes aislados: Modales, ui/button, ui/table, etc.
│       ├── Layouts/            # Plantillas maestras (AuthenticatedLayout.jsx)
│       ├── Pages/              # Vistas principales renderizadas (Index.jsx)
│       └── app.jsx             # Punto de entrada de Vite y React
└── vite.config.js              # Configuración del empaquetador
```
## 4. Artefactos del Sistema
4.1 Script de Base de Datos
En este espacio se define la estructura de tablas, llaves foráneas y restricciones del sistema:

-- 1. Tabla de Usuarios
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT UUID(),
    email VARCHAR(80) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL,
    remember_token VARCHAR(100) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW(),
    updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT chk_users_rol CHECK (rol IN ('Solicitante', 'Encargado', 'Tecnico'))
);

-- 2. Tabla de Departamentos
CREATE TABLE departamentos (
    id VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT UUID(),
    nombre VARCHAR(255) NOT NULL,
    brinda_mantenimiento BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT NOW(),
    updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW()
);

-- 3. Tabla de Personal
CREATE TABLE personal (
    id VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT UUID(),
    usuario_id VARCHAR(36) NOT NULL, 
    departamento_id VARCHAR(36) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW(),
    updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW()
);

-- 4. Tabla de Solicitudes
CREATE TABLE solicitudes (
    id VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT UUID(),
    folio VARCHAR(50) NOT NULL UNIQUE,
    fecha_elaboracion DATE NOT NULL,
    descripcion_servicio TEXT NOT NULL,
    departamento_solicitante_id VARCHAR(36) NOT NULL,
    departamento_destino_id VARCHAR(36) NOT NULL,
    solicitante_id VARCHAR(36) NOT NULL,
    responsable_id VARCHAR(36) DEFAULT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    created_at DATETIME NOT NULL DEFAULT NOW(),
    updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT chk_solicitudes_estado CHECK (estado IN ('Pendiente', 'Aceptada', 'Rechazada', 'Completada'))
);

-- 5. Foreign Keys
ALTER TABLE personal
    ADD CONSTRAINT fk_personal_usuario FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_personal_departamento FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE RESTRICT;

ALTER TABLE solicitudes
    ADD CONSTRAINT fk_solicitud_depto_solicitante FOREIGN KEY (departamento_solicitante_id) REFERENCES departamentos(id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_solicitud_depto_destino FOREIGN KEY (departamento_destino_id) REFERENCES departamentos(id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_solicitud_solicitante FOREIGN KEY (solicitante_id) REFERENCES personal(id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_solicitud_responsable FOREIGN KEY (responsable_id) REFERENCES personal(id) ON DELETE SET NULL;

INSERT INTO departamentos (nombre, brinda_mantenimiento) 
VALUES 
    ('Centro de Información', FALSE),
    ('Centro de Cómputo', TRUE),
    ('Mantenimiento de Equipo', TRUE),
    ('Recursos Materiales y servicios', TRUE);

CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload LONGTEXT NOT NULL,
    last_activity INT NOT NULL
);

CREATE INDEX sessions_user_id_index ON sessions (user_id);
CREATE INDEX sessions_last_activity_index ON sessions (last_activity);

CREATE TABLE cache (
    `key` VARCHAR(255) PRIMARY KEY,
    value MEDIUMTEXT NOT NULL,
    expiration INT NOT NULL
);

CREATE TABLE cache_locks (
    `key` VARCHAR(255) PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    expiration INT NOT NULL
);

## 4.2 Diagrama de Flujo
Representación del flujo de los procesos y la interacción de los roles (Solicitante, Encargado, Técnico) dentro de la aplicación. Código de Mermaid:
---
config:
  layout: dagre
---
flowchart TB
    A["Inicio: Pantalla de Login"] --> B{"¿Cuál es el rol del usuario?"}
    
    %% 1. SOLICITANTE
    B -- "1. Solicitante" --> C["Panel del Solicitante"]
    C --> C1["Ver historial propio y descargar PDF"]
    C --> C2["Crear nueva solicitud"]
    C2 --> C3["Elegir Depto. Destino (que brinde mto.) y describir servicio"]
    C3 --> C4["Estado automático: Pendiente"]
    C --> C_ACC{"Acción sobre solicitud propia"}
    C_ACC -- "Estado: Pendiente" --> C5["Editar o Eliminar solicitud"]
    C_ACC -- "Estado: Aceptada / Rechazada / Completada" --> C6["Bloqueada: No editable ni eliminable"]

    %% 2. ENCARGADO
    B -- "2. Encargado de Mto." --> D["Panel de Encargado"]
    D --> D1["Ver solicitudes dirigidas a SU departamento y descargar PDF"]
    D --> D_CREAR["Crear nueva solicitud institucional"]
    D_CREAR --> D_CREAR_OK["Estado inicial: Pendiente o asignada"]
    D --> D2{"¿Qué acción desea realizar según el estatus?"}
    D2 -- "Pendiente: Aceptar y Asignar" --> D3["Designar técnico de su depto y pasar a 'Aceptada'"]
    D2 -- "Pendiente: Rechazar" --> D_REJ["Confirmar y pasar a 'Rechazada'"]
    D2 -- "Pendiente: Eliminar" --> D_DEL["Eliminar permanentemente la solicitud"]
    D2 -- "Pendiente: Editar" --> D6{"¿Se modificó el Depto. Destino?"}
    D6 -- "Sí" --> D7["Transferir solicitud: Pasa a 'Pendiente' en el nuevo Depto"]
    D6 -- "No" --> D8["Guardar cambios en la solicitud"]
    D2 -- "Aceptada: Completar" --> D_COMP["Marcar mantenimiento como 'Completada'"]
    D2 -- "Aceptada / Rechazada / Completada: Editar o Eliminar" --> D5["Acceso denegado: Solicitud bloqueada"]

    %% 3. TÉCNICO
    B -- "3. Personal Técnico" --> E["Panel de Personal Técnico"]
    E --> E_TABS{"Seleccionar Pestaña"}
    
    %% Pestaña: Órdenes Asignadas
    E_TABS -- "Órdenes Asignadas" --> E1["Ver solicitudes asignadas a él y descargar PDF"]
    E1 --> E1_ACT{"¿Estatus de la orden?"}
    E1_ACT -- "Aceptada" --> E2["Marcar solicitud como 'Completada'"]
    E1_ACT -- "Completada" --> E1_DONE["Mantenimiento finalizado"]
    
    %% Pestaña: Mis Solicitudes
    E_TABS -- "Mis Solicitudes" --> E3["Ver solicitudes creadas por él"]
    E3 --> E4["Crear nueva solicitud hacia área de mantenimiento"]
    E4 --> E5["Estado automático: Pendiente"]
    E3 --> E6{"Acción sobre solicitud propia"}
    E6 -- "Estado: Pendiente" --> E7["Editar o Eliminar solicitud"]
    E6 -- "Estado: Aceptada / Rechazada / Completada" --> E8["Bloqueada: No editable ni eliminable"]

    classDef inicio fill:#eef2ff,stroke:#818cf8,color:#1e1b4b
    classDef decision fill:#fefce8,stroke:#facc15,color:#713f12
    classDef solicitante fill:#f0fdf4,stroke:#4ade80,color:#14532d
    classDef encargado fill:#f0fdfa,stroke:#2dd4bf,color:#134e4a
    classDef personal fill:#fff7ed,stroke:#fb923c,color:#7c2d12


## 4.3 Diagrama de Base de Datos (Entidad-Relación)
Modelo relacional que ilustra las conexiones entre Usuarios, Personal, Departamentos y Solicitudes:
---
config:
  theme: mc
  layout: elk
---
erDiagram
    direction TB

     USERS {
        VARCHAR_36 id PK
        VARCHAR_80 email UK
        VARCHAR_255 password
        VARCHAR_30 rol "CHECK (Solicitante, Encargado, Tecnico)"
        DATETIME created_at
        DATETIME updated_at
    }

    DEPARTAMENTOS {
        VARCHAR_36 id PK
        VARCHAR_255 nombre
        BOOLEAN brinda_mantenimiento "Indica si es área técnica de soporte"
        DATETIME created_at
        DATETIME updated_at
    }

    PERSONAL {
        VARCHAR_36 id PK
        VARCHAR_36 usuario_id FK
        VARCHAR_36 departamento_id FK
        VARCHAR_255 nombre
        DATETIME created_at
        DATETIME updated_at
    }

    SOLICITUDES {
        VARCHAR_36 id PK
        VARCHAR_50 folio UK
        DATE fecha_elaboracion
        TEXT descripcion_servicio
        VARCHAR_36 departamento_solicitante_id FK
        VARCHAR_36 departamento_destino_id FK
        VARCHAR_36 solicitante_id FK
        VARCHAR_36 responsable_id FK "Nullable"
        VARCHAR_50 estado "CHECK (Pendiente, Aceptada, Rechazada, Completada)"
        DATETIME created_at
        DATETIME updated_at
    }

    USERS ||--|| PERSONAL : "tiene perfil de"
    DEPARTAMENTOS ||--o{ PERSONAL : "tiene asignado"
    DEPARTAMENTOS ||--o{ SOLICITUDES : "solicita"
    DEPARTAMENTOS ||--o{ SOLICITUDES : "atiende"
    PERSONAL ||--o{ SOLICITUDES : "elabora"
    PERSONAL ||--o{ SOLICITUDES : "es responsable"

    classDef departamento fill:#eef2ff,stroke:#6366f1,stroke-width:2px,color:#1e1b4b
    classDef usuario fill:#faf5ff,stroke:#c084fc,stroke-width:2px,color:#581c87
    classDef personal fill:#f0fdfa,stroke:#14b8a6,stroke-width:2px,color:#134e4a
    classDef solicitud fill:#fff7ed,stroke:#f97316,stroke-width:2px,color:#7c2d12

    class DEPARTAMENTOS departamento
    class USERS usuario
    class PERSONAL personal
    class SOLICITUDES solicitud

## 5. Estado Actual del Desarrollo (Avances)

Se ha completado el ciclo integral del sistema de mantenimiento con control de acceso basado en roles (RBAC) y generación de reportes oficiales:

* **Estructura y Validación de Base de Datos:**
  * Base de datos MariaDB estructurada con UUIDs, llaves foráneas y restricciones `CHECK`.
  * Bandera `brinda_mantenimiento` en `departamentos` para filtrar áreas que ofrecen servicio técnico (*Centro de Cómputo*, *Mantenimiento de Equipo*, *Recursos Materiales y servicios*).
* **Autenticación y Registro:**
  * Restricción dinámica en el formulario de registro: Departamentos no prestadores de servicio solo permiten el rol `Solicitante`.
* **Visualización Dinámica por Rol (Panel de Control):**
  * `Solicitante`: Visualiza exclusivamente sus propias solicitudes.
  * `Encargado`: Visualiza las solicitudes dirigidas a su departamento.
  * `Tecnico`: Panel dual con pestañas (*"Órdenes Asignadas"*, *"Mis Solicitudes"*, *"Todas"*) para alternar entre sus tareas técnicas y sus peticiones personales.
* **Ciclo de Vida de las Solicitudes (CRUD Completo e Independiente):**
  * **Creación:** `CreateSolicitudModal` con bloqueo de datos para solicitante/técnico y filtrado de destinos técnicos (`brinda_mantenimiento = true`).
  * **Edición y Transferencia:** `EditSolicitudModal` con bloqueo de solicitudes procesadas (`Aceptada`/`Completada`) y transferencia automática con reseteo de técnico si se cambia de departamento destino.
  * **Aceptación y Asignación:** `AceptarSolicitudModal` exclusivo para el Encargado, exigiendo designar un técnico perteneciente al departamento destino.
  * **Rechazo y Finalización:** `ConfirmStatusDialog` (`AlertDialog` de Shadcn) para confirmar rechazos por el Encargado o marcar como `Completada` por el Técnico.
  * **Eliminación:** `DeleteSolicitudDialog` accesible para solicitudes en estado `Pendiente`.
  * **Impresión Oficial:** Generación y descarga de PDF con Dompdf (`/solicitudes/{id}/pdf`), cumpliendo con el formato institucional `ITT-POE-06-02` (ISO 9001:2015).