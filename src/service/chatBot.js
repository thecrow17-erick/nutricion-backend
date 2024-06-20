import OpenAI from 'openai';
import { chatContext } from '../libs/chat_context.js';
import {config} from 'dotenv'
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings, OpenAI as LangchainOpenAI} from "@langchain/openai";
import { loadQAStuffChain } from "langchain/chains";
// import { Document } from "langchain/document";
import crypto from 'crypto';
// const LangchainOpenAI = require("@langchain/openai").OpenAI;

config({path: ".env"})

const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const pc = new Pinecone({
  apiKey: process.env.PINECODE_API_KEY
});


const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  batchSize: 100,
  model: 'text-embedding-3-small',
});

const indexName = 'nutrition';

const index = pc.Index(indexName);

function generateValidId(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export const chatGptBot = async(products=[], services=[],user,chat=[],prompt="" )=>{

  // const schedule = ["Quiero que seas un asesor de nutrición y fitness. Lee cuidadosamente las siguientes instrucciones:", `Este es el formato JSON para Producto: json { "name": "String",  "description": "String",  "price": "double", "stock": "integer", "category": { "name": "String","description": "String"}}`, `Este es el formato JSON para Servicio: json{ "description": "String","price": "double" }`, 
  //   `1. Si el cliente está registrado en nuestro sistema:
  //   - Refierete a él por su nombre (${user.name}).
  //   - Salúdalo por su nombre y pregúntale si está interesado nuevamente en nuestros productos o servicios disponibles.`,
  //   `2. Si el cliente es nuevo y/o pregunta sobre que ofrecemos o que vendemos o si necesita algo para mejorar su salud o mejorar su peso le mencionas nuestros productos y/o servicios:
  //    - Menciona cada uno de nuestros productos y servicios disponibles, junto con sus respectivos precios y descripciones en los siguientes arreglo JSON:
  //    Productos: ${products.map((product)=> {return `{
  //     "name": ${product.name}, 
  //     "description": ${product.description}, 
  //     "price": ${product.price}, 
  //     "stock": ${product.stock}, 
  //     "category": {
  //       "name": ${product.category.name},
  //       "description": ${product.category.description}
  //     }
  //   }`})}
  
  //    Servicios: ${services.map((service)=> {return `{
  //     "description": ${service.description},
  //     "price": ${service.price}
  //   }`})}`,
  //   `3. Si el cliente pregunta sobre un producto específico:
  //    - Proporciona más información y el precio del producto mencionado, si está disponible.
  //    - Si el producto no está en stock, ofrece una alternativa y menciona sus beneficios para intentar convencer al cliente de comprarlo.`,

  //   `4. Si el cliente pregunta sobre un servicio específico:
  //    - Proporciona más información y el precio del servicio mencionado, e intenta convencer al cliente de sus beneficios.`,
    
  //   `5. Si el cliente no menciona nada específico sobre productos o servicios:
  //    - Reitera que somos una empresa que vende productos y servicios relacionados con fitness.`, 
    
  //   `6. Responde también a preguntas generales o específicas sobre nuestros productos.`,
    
  //    `7. Si el cliente decide o esta indeciso de comprar tienes que agregarle una oferta a su servicio como un producto que tengamos disponible o hacerle un descuento a lo que desea adquirir.`
  // ];

  // const scheduleEmbeddings = await embeddings.embedDocuments(schedule);

  // console.log("Length of embeddings :" + scheduleEmbeddings.length);

  // const scheduleVectors = scheduleEmbeddings.map((embedding, i) => ({
  //   id: generateValidId(schedule[i]),
  //   values: embedding,
  //   metadata: {
  //       text: schedule[i]
  //   }
  // }));

  // await index.upsert(scheduleVectors)

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
  console.log(chatHistory[0])

  try {

    const completions = await openAI.chat.completions.create({
      messages: chatHistory,
      model: "gpt-3.5-turbo",
      max_tokens: 200,
      temperature: 0.2
    });

    // const query = completions.choices[0].message.content;

    // const queryEmbedding = await new OpenAIEmbeddings().embedQuery(query);
    
    // let queryResponse = await index.query({
    //   vector: queryEmbedding,
    //   topK : 3,
    //   includeMetadata: true
    // })

    // const concatenatedText = queryResponse.matches
    //   .map((match) => match.metadata.text)
    //   .join(" ");


    // console.log(`Concatenated text: ${concatenatedText}`);

    // const llm = new LangchainOpenAI({
    //   openAIApiKey: process.env.OPENAI_API_KEY
    // });

    // const chain = loadQAStuffChain(llm);
    
    // const result  = await chain.call({
    //   signal: {
    //       pageContent: concatenatedText,
    //       question: query
    //     }
    // });

    // console.log(`Answer: ${result.text}`);

    const responseContent = completions.choices[0].message.content;
    console.log(responseContent)


    // Asegurarse de que la respuesta sea un JSON válido
    const jsonResponse = {
      "message": responseContent
    }
    
    // Verificar que jsonResponse tenga la estructura adecuada

    if (jsonResponse && typeof jsonResponse.message === 'string') {
      return jsonResponse;
    } else {
      throw new Error('Respuesta JSON no tiene la estructura adecuada.');
    }
  } catch (error) {
    console.error('Error procesando la respuesta:', error);
    // return {
    //   message: 'Hubo un error procesando tu solicitud. Por favor, intenta de nuevo.'
    // };
  }
  
  

  // const completions = await openAI.chat.completions.create({
  //   messages: chatHistory,
  //   model: "gpt-4",
  //   max_tokens: 200,
  //   temperature: 0.2
  // })
  // return JSON.parse(completions.choices[0].message.content);

}