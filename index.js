import express from 'express'
import dbConnection from './dbConnection.js'
import roleRouter from './routes/roleRoutes.js'
import cors from 'cors'

const app = express()

app.use(cors(process.env.CLIENT_URL))
app.set('trust proxy', true)

app.use(express.json())

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.use("/roles", roleRouter)

app.listen(process.env.PORT, ()=>{
    dbConnection()
    console.log(`Server is runing in port ${process.env.PORT}`)
})