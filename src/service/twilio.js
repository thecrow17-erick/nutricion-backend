import twilio from 'twilio'
import {config} from 'dotenv'

config({path: ".env"})

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN  ;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const client = new twilio(accountSid,authToken)

export const sendMessage = async(message,phone='',report = false) =>{
    try {
        console.log(phone);
        const response = await client.messages.create({
            body: message,
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+591'+phone,
            mediaUrl:report ? 'https://drive.google.com/uc?export=download&id=1fypXChOTuRhawVNIk_gJXDatqPU1r83u':undefined
        });
        console.log('Mensaje enviado:', response.sid);
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
    }
} 