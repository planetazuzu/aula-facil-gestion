
export interface EmailContent {
  subject: string;
  html: string;
}

function formatDate(dateString?: string): string {
  if (!dateString) return "fecha programada";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateString!;
  }
}

export function getEmailTemplate(template: string, data: Record<string, any>): EmailContent {
  const templates: Record<string, (data: Record<string, any>) => EmailContent> = {
    enrollment_confirmation: (data) => ({
      subject: "Confirmación de inscripción en curso",
      html: `
        <h1>¡Inscripción confirmada!</h1>
        <p>Hola ${data.userName || "Estudiante"},</p>
        <p>Has sido inscrito exitosamente en el curso <strong>${data.courseTitle || "seleccionado"}</strong>.</p>
        <p>El curso comienza el <strong>${formatDate(data.startDate)}</strong>.</p>
        <p>Gracias por confiar en Empresa Formacion para tu desarrollo profesional.</p>
      `
    }),
    waitlist_update: (data) => ({
      subject: "Actualización de lista de espera",
      html: `
        <h1>¡Buenas noticias!</h1>
        <p>Hola ${data.userName || "Estudiante"},</p>
        <p>Una plaza está disponible para el curso <strong>${data.courseTitle || "solicitado"}</strong>.</p>
        <p>Tienes 24 horas para confirmar tu inscripción.</p>
        <p>Accede a tu cuenta para confirmar tu asistencia.</p>
      `
    }),
    course_reminder: (data) => ({
      subject: "Recordatorio de curso",
      html: `
        <h1>Recordatorio de curso</h1>
        <p>Hola ${data.userName || "Estudiante"},</p>
        <p>Tu curso <strong>${data.courseTitle || "programado"}</strong> comienza mañana a las <strong>${data.startTime || "hora programada"}</strong>.</p>
        <p>¡No olvides asistir!</p>
      `
    }),
    course_cancellation: (data) => ({
      subject: "Cancelación de curso",
      html: `
        <h1>Información importante sobre tu curso</h1>
        <p>Hola ${data.userName || "Estudiante"},</p>
        <p>Lamentamos informarte que el curso <strong>${data.courseTitle || "seleccionado"}</strong> ha sido cancelado.</p>
        <p>Por favor, contacta con administración para más información.</p>
      `
    }),
    test_notification: (data) => ({
      subject: "Prueba de notificación",
      html: `
        <h1>Prueba de notificación por correo</h1>
        <p>Hola ${data.userName || "Usuario"},</p>
        <p>Este es un correo de prueba para verificar la configuración de notificaciones.</p>
        <p>Si estás recibiendo este mensaje, la configuración es correcta.</p>
        <p>Fecha y hora de envío: ${new Date().toLocaleString()}</p>
      `
    })
  };

  const templateFn = templates[template];
  if (!templateFn) {
    return {
      subject: "Notificación de Empresa Formacion",
      html: "<p>Notificación del sistema.</p>"
    };
  }

  return templateFn(data);
}

export function getWhatsAppTemplate(template: string, data: Record<string, any>): string {
  const templates: Record<string, (data: Record<string, any>) => string> = {
    enrollment_confirmation: (data) => 
      `¡Inscripción confirmada!\nHola ${data.userName || "Estudiante"},\nHas sido inscrito exitosamente en el curso "${data.courseTitle || "seleccionado"}".\nComienza el ${formatDate(data.startDate)}.\nGracias por confiar en Empresa Formacion.`,
    
    waitlist_update: (data) =>
      `¡Buenas noticias!\nHola ${data.userName || "Estudiante"},\nUna plaza está disponible para el curso "${data.courseTitle || "solicitado"}".\nTienes 24 horas para confirmar tu inscripción.\nAccede a tu cuenta para confirmar tu asistencia.`,
    
    course_reminder: (data) =>
      `Recordatorio:\nHola ${data.userName || "Estudiante"},\nTu curso "${data.courseTitle || "programado"}" comienza mañana a las ${data.startTime || "hora programada"}.\n¡No olvides asistir!`,
    
    course_cancellation: (data) =>
      `Información importante:\nHola ${data.userName || "Estudiante"},\nLamentamos informarte que el curso "${data.courseTitle || "seleccionado"}" ha sido cancelado.\nPor favor, contacta con administración para más información.`,
    
    test_notification: (data) =>
      `Prueba de notificación por WhatsApp\nHola ${data.userName || "Usuario"},\nEste es un mensaje de prueba para verificar la configuración de notificaciones.\nSi estás recibiendo este mensaje, la configuración es correcta.\nFecha y hora de envío: ${new Date().toLocaleString()}`
  };

  const templateFn = templates[template];
  return templateFn ? templateFn(data) : "Notificación de Empresa Formacion";
}
