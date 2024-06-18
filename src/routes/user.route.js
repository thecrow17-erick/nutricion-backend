import {Router} from 'express'
import prisma from '../libs/prisma.js';
import { categoriesDataSeed, productsDataSeed, servicesDataSeed, usersDataSeed } from '../seed/seed.db.js';
import { demoController } from '../controller/demo.controller.js';

export const router = Router();




router.post('/seed',async(_, res)=>{
  await prisma.user.createMany({
    data: usersDataSeed
  })

  await prisma.category.createMany({
    data: categoriesDataSeed
  })

  await prisma.product.createMany({
    data: productsDataSeed
  })

  await prisma.service.createMany({
    data: servicesDataSeed
  })

  return res.json("seed ok");

});

router.post("/chat", demoController)
