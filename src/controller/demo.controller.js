import {  PrismaClient } from "@prisma/client";
import { request, response } from "express";
import { chatGptBot } from "../service/chatBot.js";
import { sendMessage } from "../service/twilio.js";

const prisma = new PrismaClient();

export const demoController = async(req= request, res = response)=>{
  const userName = req.body.ProfileName;
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
  const chatCreate = await prisma.chat.create({
    data:{
      userId: user.id,
      botMessage: messageGpt.message,
      message: prompt
    }
  })

  function generateReport(text) {
    const keywords = /reporte|preforma/i; // La 'i' hace que la búsqueda no sea sensible a mayúsculas y minúsculas
    return keywords.test(text);
  }

  const report = generateReport(prompt);

  await sendMessage(`${messageGpt.message}`,phone, report);

  return res.json({
    chatCreate
  })
}