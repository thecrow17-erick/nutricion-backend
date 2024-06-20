import { Pinecone } from '@pinecone-database/pinecone';
let { OpenAIEmbeddings } = require("@langchain/openai");
let { loadQAStuffChain } = require("langchain/chains");

const schedule = ["Quiero que seas un asesor de nutrición y fitness. Lee cuidadosamente las siguientes instrucciones:", `Este es el formato JSON para Producto: json { "name": "String",  "description": "String",  "price": "double", "stock": "integer", "category": { "name": "String","description": "String"}}`, `Este es el formato JSON para Servicio: json{ "description": "String","price": "double" }`, 
        `1. Si el cliente está registrado en nuestro sistema:
        - Refierete a él por su nombre.
        - Salúdalo por su nombre y pregúntale si está interesado nuevamente en nuestros productos o servicios disponibles.`,
        `2. Si el cliente es nuevo y/o pregunta sobre que ofrecemos o que vendemos o si necesita algo para mejorar su salud o mejorar su peso le mencionas nuestros productos y/o servicios:
         - Menciona cada uno de nuestros productos y servicios disponibles, junto con sus respectivos precios y descripciones en los siguientes arreglo JSON:
         Productos: ${products.map((product)=> {return `{
          "name": ${product.name}, 
          "description": ${product.description}, 
          "price": ${product.price}, 
          "stock": ${product.stock}, 
          "category": {
            "name": ${product.category.name},
            "description": ${product.category.description}
          }
        }`})}

         Servicios: ${services.map((service)=> {return `{
          "description": ${service.description},
          "price": ${service.price}
        }`})}`,
        `3. Si el cliente pregunta sobre un producto específico:
         - Proporciona más información y el precio del producto mencionado, si está disponible.
         - Si el producto no está en stock, ofrece una alternativa y menciona sus beneficios para intentar convencer al cliente de comprarlo.`,
        `4. Si el cliente pregunta sobre un servicio específico:
         - Proporciona más información y el precio del servicio mencionado, e intenta convencer al cliente de sus beneficios.`,
        `5. Si el cliente no menciona nada específico sobre productos o servicios:
         - Reitera que somos una empresa que vende productos y servicios relacionados con fitness.`, 
        `6. Responde también a preguntas generales o específicas sobre nuestros productos.`,
        `7. Si el cliente decide o esta indeciso de comprar tienes que agregarle una oferta a su servicio como un producto que tengamos disponible o hacerle un descuento a lo que desea adquirir.`
    ];


const pc = new Pinecone({
  apiKey: process.env.PINECODE_API_KEY
});

await pc.createIndex({
    name: 'quickstart',
    dimension: 8, // Replace with your model dimensions
    metric: 'euclidean', // Replace with your model metric
    spec: { 
        serverless: { 
            cloud: 'aws', 
            region: 'us-east-1' 
        }
    } 
});

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    batchSize: 100,
    model: 'text-embedding-3-small',
});

const indexName = 'nutrition';

const index = pc.Index(indexName);

const scheduleEmbeddings = await embeddings.embedDocuments(schedule);

console.log("Length of embeddings :" + scheduleEmbeddings.length);

const scheduleVectors = scheduleEmbeddings.map((embedding, i) => ({
    id: schedule[i],
    values: embedding,
    metadata: {
        text: schedule[i]
    }
}));

await index.upsert(scheduleVectors)