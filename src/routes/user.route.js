import { Router } from 'express';
import prisma from '../libs/prisma.js';
import { categoriesDataSeed, productsDataSeed, servicesDataSeed } from '../seed/seed.db.js';
import { demoController } from '../controller/demo.controller.js';
import { getReportBill } from '../report/reportBill.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Obtiene la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const router = Router();

router.post('/seed',async(_, res)=>{
  

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

  try {
    const pdfDoc = await getReportBill(body);
    pdfDoc.info.Title = "Cotizacion";

    // Crear la ruta del archivo en la carpeta uploads
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    const filePath = path.join(uploadsDir, 'report.pdf');
    const writeStream = fs.createWriteStream(filePath);

    pdfDoc.pipe(writeStream);
    pdfDoc.end();

    writeStream.on('finish', () => {
      res.header('Content-Type', 'application/pdf');
      res.sendFile(filePath);
    });

    writeStream.on('error', (err) => {
      console.error('Error al guardar el archivo:', err);
      res.status(500).send('Error al guardar el archivo');
    });
  } catch (error) {
    console.error('Error al generar el reporte:', error);
    res.status(500).send('Error al generar el reporte');
  }

})