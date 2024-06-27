import { createPdf } from "../libs/pdfMake.js"
import { fetchImageBase64 } from "../helpers/imageBase64.js"
import { billReport } from "../documents/bill.js";


export const getReportBill = async(body)=>{
  if(body.logoUrl){
    try {
      body.logoBase64 = await fetchImageBase64(body.logoUrl);
    } catch (err) {
      body.logoBase64 = null;
    }
  }
  const docDefinition = billReport(body);
  return createPdf(docDefinition);
}