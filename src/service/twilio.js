import twilio from 'twilio'
import {config} from 'dotenv'

config({path: ".env"})

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN  ;

const client = new twilio(accountSid,authToken)

export const sendMessage = async(message,phone='') =>{
    try {
        const response = await client.messages.create({
            body: message,
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+591'+phone
        });
        console.log('Mensaje enviado:', response.sid);
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
    }
} 