import OpenAI from 'openai';
import { chatContext } from '../libs/chat_context.js';
import {config} from 'dotenv'

config({path: ".env"})

const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const chatGptBot = async(products=[], services=[],user,chat=[],prompt="" )=>{

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
  
  
  // chat.map((c) => {
  //   chatHistory.push({
  //     role: "user",
  //     content: c.message
  //   });
  //   chatHistory.push({
  //     role: "assistant",
  //     content: c.botMessage
  //   })
  // })
  chatHistory.push({
    role: "user",
    content: prompt
  })
  console.log(chatHistory[0])

  const completions = await openAI.chat.completions.create({
    messages: chatHistory,
    model: "gpt-4",
    max_tokens: 200,
    temperature: 0.3
  })
  return JSON.parse(completions.choices[0].message.content);

}