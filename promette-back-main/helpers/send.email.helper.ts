import nodemailer from "nodemailer";


export const sendEmail = async (
  fromEmail: string,
  passwordEmail: string,
  toEmail: string,
  htmlContent: string,
  subject: string = "Notificaciones PROMETTE" // Subject opcional con valor por defecto
): Promise<void> => {
  try {

    // Configuramos el transporte de correo
    const transporter = nodemailer.createTransport({
      // service: "SMTP",
	  host: "mail.septlaxcala.gob.mx",
	  port: 465,
	  secure: true,
      auth: {
        user: fromEmail,
        pass: passwordEmail,
      },
	  // logger: true,
	  // debug: true,
    });

    // Configuramos las opciones del correo
    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: subject,
      html: htmlContent, // Usamos el contenido del archivo HTML
    };

    // Enviamos el correo
    await transporter.sendMail(mailOptions);
    console.log(`✅ Correo enviado a ${toEmail}`);
  } catch (error) {
    console.error("❌ Error al enviar el correo:", error);
  
    
  }
};
