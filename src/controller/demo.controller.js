import {  PrismaClient } from "@prisma/client";
import { request, response } from "express";
import { chatGptBot } from "../service/chatBot.js";
import { sendMessage } from "../service/twilio.js";



const prisma = new PrismaClient();

export const demoController = async(req= request, res = response)=>{
  // console.log(req.body);
  const phone = req.body.From.split("+591")[1];
  const prompt = req.body.Body.trim();
  const [products, services ,findUser] = await Promise.all([
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
    prisma.user.findFirst({
      where:{
        phone
      }
    })
  ])
  let chatUser= [];
  // console.log(products, services);
  
  if(findUser){
    chatUser = await prisma.chat.findMany({
      where: {
        userId: findUser.id
      }
    })
  }
  const messageGpt = await chatGptBot(products,services,findUser,chatUser,prompt);
  console.log(messageGpt)
  const chatCreate = await prisma.chat.create({
    data:{
      userId: findUser.id,
      botMessage: messageGpt.message,
      message: prompt
    }
  })
  await sendMessage(`${messageGpt.message}`);

  return res.json({
    chatCreate
  })
}