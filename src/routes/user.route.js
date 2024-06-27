import {Router} from 'express'
import prisma from '../libs/prisma.js';
import { categoriesDataSeed, productsDataSeed, servicesDataSeed, usersDataSeed } from '../seed/seed.db.js';
import { demoController } from '../controller/demo.controller.js';
import { getReportBill } from '../report/reportBill.js';

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


router.get("/report", async(_,res)=>{
  const body = {
    nombre_empresa: "Nutrition by Niqueya",
    idUsuario: 5,
    clientPhone: "78432889" ,
    logoUrl: "https://www.zarla.com/images/zarla-reto-keto-1x1-2400x2400-20220329-ccxq7vh7ykx9kwrvbdwy.png?crop=1:1,smart&width=250&dpr=2",
    products: [
      {
        ID: 1,
        Producto: "manzana",
        Precio:   "12.00",
        Cantidad: 10,
        Total:    10.56
      },
      {
        ID: 1,
        Producto: "manzana",
        Precio:   "12.00",
        Cantidad: 10,
        Total:    10.56
      },
      {
        ID: 1,
        Producto: "manzana",
        Precio:   "12.00",
        Cantidad: 10,
        Total:    10.56
      }
    ]
  }
  const pdfDoc = await getReportBill(body);

  res.header('Content-Type', 'application/pdf');
  pdfDoc.info.Title = "Cotizacion";
  pdfDoc.pipe(res);
  pdfDoc.end();
})