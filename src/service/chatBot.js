import OpenAI from 'openai';
import { chatContext } from '../libs/chat_context.js';
import {config} from 'dotenv'
import path, {dirname, join} from 'path';

import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings, OpenAI as LangchainOpenAI} from "@langchain/openai";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";
import { TextLoader } from "langchain/document_loaders/fs/text";


// import crypto from 'crypto';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { fileURLToPath } from 'url';
// const LangchainOpenAI = require("@langchain/openai").OpenAI;

import * as fs from 'fs'

config({path: ".env"})

const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const client = new Pinecone({
  apiKey: process.env.PINECODE_API_KEY
});

  
const indexName = 'nutrition';

const index = client.Index(indexName);

export const chatGptBot = async(products=[], services=[],user,chat=[],prompt="" )=>{

  const schedule =
    `Eres un asesor de nutrición y fitness. Lee cuidadosamente las siguientes instrucciones:, 
    1. Si el cliente está registrado y tenemos su nombre:
    - Este es el nombre del cliente ${user.name} tienes que saludarlo, en caso no saber el nomber Saludalo normalmente y al final de la conversacion le preguntas por su nombre.
    - Salúdalo por su nombre y pregúntale si está interesado nuevamente en nuestros productos o servicios disponibles.

    2. Si el cliente es nuevo y/o pregunta sobre que ofrecemos o que vendemos o si necesita algo para mejorar su salud o mejorar su peso le mencionas nuestros productos y/o servicios:
     - Menciona cada uno de nuestros productos y servicios disponibles, junto con sus respectivos precios y descripciones:
     Productos: ${products.map((product)=> {return `
      {
        "name": ${product.name}, 
        "description": ${product.description}, 
        "price": ${product.price}, 
        "stock": ${product.stock}, 
        "category": {
          "name": ${product.category.name},
          "description": ${product.category.description}
        }
      }`})}
  
     Servicios: ${services.map((service)=> {return `
      {
        "description": ${service.description},
        s"price": ${service.price}
      }`})},

    3. Si el cliente pregunta sobre que producto tenemos:
     - Menciona cada uno de nuestros productos mas su precio.
     - Si es posible hazle un descuento.
     Productos: ${products.map((product)=> {return `
      {
        "name": ${product.name}, 
        "description": ${product.description}, 
        "price": ${product.price}, 
        "stock": ${product.stock}, 
        "category": {
          "name": ${product.category.name},
          "description": ${product.category.description}
        }
      }`})},

    4. Si el cliente pregunta sobre que servicios tenemos:
     - Menciona cada uno de nuestros servicios junto con sus respectivos precios y descripciones.
     - Si es posible hazle una promocion aumentandole unos productos de regalo si en caso desea adquirir o comprar el servicio.
     Servicios: ${services.map((service)=> {return `
      {
        "description": ${service.description},
        s"price": ${service.price}
      }`})},
    
    5. Si el cliente pregunta sobre un producto específico:
     - Proporciona más información y el precio del producto mencionado, si está disponible.
     - Si el producto no está en stock, ofrece una alternativa y menciona sus beneficios para intentar convencer al cliente de comprarlo.

    6. Si el cliente pregunta sobre un servicio específico:
     - Proporciona más información y el precio del servicio mencionado, e intenta convencer al cliente de sus beneficios para que pueda comprarlo.
    
    7. Si el cliente no menciona nada específico sobre productos o servicios o sobre salud y fitness:
     - Reitera que somos una empresa que vende productos y servicios relacionados con la salud y el fitness. 
    
    8. Responde también a preguntas generales o específicas sobre nuestros productos y/o servicios.
    
    9. Si el cliente decide o esta indeciso de comprar tienes que agregarle una oferta a su servicio como un producto que tengamos disponible o hacerle un descuento a lo que desea adquirir.
    
    10. Tienes que responder de la manera mas natural posible para que el cliente se sienta comodo ante cualquier respuesta

    11. Si el cliente te pide una proforma tu le dices lo siguiente "Enseguida te generaremos la proforma".

    12. Si no entiendes algo puedes decirle al cliente "Losiento porfavor me puedes explicar de nuevo".
    `
  ;
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const rutaArchivo = join(__dirname, '../documents', 'intructions.txt');
  try {
    fs.writeFileSync(rutaArchivo, schedule);
    console.log('Archivo creado y guardado exitosamente');
  } catch (error) {
    console.log('Error al escribir el archivo:', error)
  }
  
  
  
  //! Update PineCone
  

  const chatHistory = chatContext(products,services,user);
  chat.forEach(c => {
    chatHistory.push({
        role: "user",
        content: c.message
      });
      chatHistory.push({
        role: "assistant",
        content: c.botMessage
      })
  })
  
  
  chatHistory.push({
    role: "user",
    content: prompt
  })

  try {



    //! Query PineCone


    const query = prompt;

    const queryEmbedding = await new OpenAIEmbeddings().embedQuery(query);
    
    let queryResponse = await index.query({
      topK: 3,
      vector: queryEmbedding,
      includeMetadata: true,
      includeValues: true,
    });

    console.log(`Found ${queryResponse.matches.length} matches...`);

    console.log(`Asking question: ${query}`);

    let respuesta;

    if(queryResponse.matches.length){
      const llm = new LangchainOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
      });

      const chain = loadQAStuffChain(llm);

      const concatenatedPageContent = queryResponse.matches
        .map((match) => match.metadata.pageContent)
        .join(" ");

      const result = await chain.call({
        input_documents: [
          new Document({
            pageContent: concatenatedPageContent,
          })
        ],
        question: query
      });
      respuesta = result.text
      console.log(`Answer: ${result.text}`);
    }else{
      console.log("ChatGPT no obtuvo ninguna respuesta");
    }
    

    const responseContent = respuesta;
    console.log(responseContent)

    
    // Asegurarse de que la respuesta sea un JSON válido
    const jsonResponse = {
      "message": responseContent
    }

    // Respuesta de ChatGPT
    // const completionsLangChain = await openAI.chat.completions.create({
    //   messages: chatHistory,
    //   model: "gpt-3.5-turbo",
    //   max_tokens: 200,
    //   temperature: 0.5
    // });

    // console.log(`Mensaje de chatGPT: ${completionsLangChain.choices[0].message.content}`)

    const completions = await openAI.chat.completions.create({
      messages: chatHistory,
      model: "gpt-3.5-turbo",
      max_tokens: 200,
      temperature: 0.5
    })
  
    console.log("Respuesta CHATGPT:",completions.choices[0].message.content);
    
    // Verificar que jsonResponse tenga la estructura adecuada
    if (jsonResponse && typeof jsonResponse.message === 'string') {
      return {
        pdf: JSON.parse(completions.choices[0].message.content),
        message: jsonResponse.message
      };
    } else {
      throw new Error('Respuesta JSON no tiene la estructura adecuada.');
    }
    

  } catch (error) {
    console.error('Error procesando la respuesta:', error);
    // return {
    //   message: 'Hubo un error procesando tu solicitud. Por favor, intenta de nuevo.'
    // };
  }
  
  

  // return JSON.parse(completions.choices[0].message.content);

}