import express from 'express'
import cors from 'cors'
import {router as userRouter} from './routes/user.route.js'
import fileUpload from 'express-fileupload'

export class Server{

  constructor(){
    this.app = express();
    this.PORT = process.env.PORT|| 3000;

    this.path = {
      demo: "/api/demo"
    }

    this.middlewares();
    this.routes();
    this.listen();
  }

  middlewares(){
    //habilitar la carpeta publica 
    this.app.use(express.static('public'));
    
    //habilitar para los pedidos API
    this.app.use(cors({
      origin: "*"
    }));

    // habilitar los formularios 
    this.app.use(express.urlencoded({extended: true}))
    this.app.use(express.json());

    this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/',
            createParentPath: true
        }));
        this.app.use('/uploads', express.static('uploads'));
  }
  
  routes(){

    this.app.use(this.path.demo, userRouter);
  }

  listen(){
    this.app.listen(this.PORT, ()=>{
      console.log(`server on port ${this.PORT}`);
    })
  }

}