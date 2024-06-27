import {  PrismaClient } from "@prisma/client";
import { request, response } from "express";
import { chatGptBot } from "../service/chatBot.js";
import { sendMessage } from "../service/twilio.js";

const prisma = new PrismaClient();

export const demoController = async(req= request, res = response)=>{
  const userName = req.body.ProfileName;
  //telefono cliente
  const phone = req.body.From.split("+591")[1];
  const prompt = req.body.Body.trim();
  let user = null;
  const [products, services ] = await Promise.all([
    prisma.product.findMany({
      where:{
        stock:{
          gt: 1
        }
      },
      select: {
        id: true,
        category: true,
        description: true,
        name: true,
        price: true,
        updatedAt: true,
        stock: true,
      }
    }),
    prisma.service.findMany(),
  ])
  let chatUser= [];
  // console.log(products, services);

  user = await prisma.user.findFirst({
    where:{
      phone
    }
  })

  if(user){
    chatUser = await prisma.chat.findMany({
      where: {
        userId: user.id
      }
    })
  }else{
    user = await prisma.user.create({
      data:{
        name:userName,
        phone
      }
    })
  }
  
  

  const messageGpt = await chatGptBot(products,services,user,chatUser,prompt);
  // console.log(messageGpt)
  console.log(messageGpt)
  const chatCreate = await prisma.chat.create({
    data:{
      userId: user.id,
      botMessage: messageGpt.message,
      message: prompt
    }
  })

  if(Array.isArray(messageGpt.pdf)){
    console.log("hola")
    const services = messageGpt.pdf.map( pro => pro.type === "Servicio" && pro);
    const productos = messageGpt.pdf.map( pro => pro.type === "Producto" && pro);
    const [pdfServices,pdfProductos] = await Promise.all([
      prisma.service.findMany({
        where:{
          id:{
            in: services.map( s => s.id)
          }
        }
      }),
      prisma.product.findMany({
        where:{
          id:{
            in: productos.map( p => p.id)
          }
        }
      })
    ])
    console.log({pdfProductos,pdfServices})
  }


  await sendMessage(`${messageGpt.message}`,phone);

  return res.json({
    chatCreate
  })
}