### 1. Alcance de Visualización en la Tabla (Qué registros ve cada rol)
  
  • Solicitante:
      • Limitación: Solo debe ver el historial de sus propias solicitudes (donde solicitante_id corresponde a su perfil de personal o a su departamento).    
      • No debe ver solicitudes creadas por otros usuarios de otros departamentos.
  • Encargado:
      • Limitación: Solo debe ver las solicitudes dirigidas a SU departamento (departamento_destino_id = departamento_id del encargado).
      • No debe ver las solicitudes operativas dirigidas a otros departamentos destino.
  • Personal Técnico:
      • Limitación: Solo debe ver las solicitudes asignadas EXCLUSIVAMENTE a él (responsable_id = personal_id del técnico).
      • No ve solicitudes pendientes sin asignar ni solicitudes asignadas a otros técnicos.
  
  ──────
  ### 2. Creación de Solicitudes (Crear Solicitud)
  
  • Solicitante:
      • Campos fijos/precargados: Su Departamento Solicitante y su Nombre de Solicitante deben ser tomados automáticamente de su sesión de usuario (no poder 
      elegirse libremente para evitar suplantación).
      • Campos ocultos: No debe ver ni seleccionar el campo Personal Asignado (Responsable).
      • Estatus: Se genera automáticamente como Pendiente (sin opción de cambio).
  • Encargado:
      • Si crea una solicitud, puede asignar o dejar pendiente de asignación.
  
  ──────
  ### 3. Edición y Reglas de Bloqueo (Editar Solicitud)
  
  • Encargado:
      • Condición de Bloqueo: Si la solicitud ya fue aceptada (o completada), el acceso queda bloqueado / no editable.
      • Transferencia de Departamento: Si la solicitud está Pendiente y el Encargado cambia el Departamento Destino, la solicitud se transfiere al nuevo     
      departamento destino (dejando de ser visible para el encargado actual y pasando a la bandeja del nuevo departamento).
  • Solicitante:
      • Solo puede editar la descripción o detalles si la solicitud sigue en estado Pendiente. En cuanto cambia a Aceptada, Rechazada o Completada, se       
      bloquea.
  • Personal Técnico:
      • No tiene permitido editar datos de la solicitud.
  
  ──────
  ### 4. Acciones de Flujo de Trabajo (Cambio de Estatus)
  
  • Encargado:
      • Es el único que puede:
          • Aceptar y Asignar: Cambiar el estatus a Aceptada y designar obligatoriamente a un Técnico (responsable_id) de su propio departamento.            
          • Rechazar: Cambiar el estatus a Rechazada.
  
  • Personal Técnico:
      • Es el único que puede marcar la solicitud como Completada cuando termina el trabajo.
      • No puede aceptar ni rechazar solicitudes.
  • Solicitante:
      • No puede modificar el estatus bajo ninguna circunstancia.
  
  ──────
  ### 5. Permisos de Eliminación (Eliminar Solicitud)
  
  • Solicitante: Solo puede eliminar solicitudes propias que aún se encuentren en estado Pendiente.
  • Encargado: Puede eliminar solicitudes dirigidas a su departamento antes de ser aceptadas/procesadas.
  • Personal Técnico: No tiene permiso de eliminación.