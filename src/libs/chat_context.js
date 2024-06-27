
export const chatContext = (products=[], services=[], user) => [
  {
    role: "system",
    content: `
      Lee cuidadosamente las siguientes instrucciones:

      1. Esto son los productos y servicios que tenemos en el siguientes arreglo JSON:
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
        }`})}

      2. Te estare enviando datos si es que el cliente pide informacion sobre algun producto o servicio.

      3. Tienes que guardar cualquier informacion de los productos y servicios que te estare enviando en un arreglo.

      4. Si el cliente pide una proforma o algo similar me generas un areglo de json con todos los productos y servicios que le hemos mencionado con un atributo extra que identifique los productos de los servicios.
      {
        "type": "String", // Producto o Servicio
        ... // Los demas atributos del producto o servicio
      }
      
      Caso contrario respondeme si o si con un "false" en todas las consultas.
    `
  }
]