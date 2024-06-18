import {Server} from './server.js'
import {config} from 'dotenv'

config({path: '.env'})
const app = new Server()
app.listen;