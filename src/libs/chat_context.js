

export const chatContext = (products=[], services=[], user) => [
  {
    role: "system",
    content: `
        Esto son los productos y servicios que tenemos en el siguientes arreglo JSON:
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
      
      No quiero que opines acerca del mensaje del cliente, solo cumple las instrucciones de abajo
      
      si el cliente pide alguna proforma o cotizacion(solamente si lo pide en sus mensajes), busca entra la conversacion los productos y servicios que le ofreciste,
      para poder filtrarlo e identificarlos, y quiero que me lo devuelvas de la siguiente manera:
      {
        "type" : string //Servicio o Producto
        "id": number //sera el identificador del producto o servicio
      }[] // estara dentro de un arreglo estos objetos, porque pueden ser mas de un servicio o producto que pide cotizar

      si no es nada de eso devuelve el siguiente json
      {
        "type" : false
      }
    `
  }
]