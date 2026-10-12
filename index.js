import express from 'express'
import dbConnection from './dbConnection.js'
import roleRouter from './routes/roleRoutes.js'
import authRoutes from './routes/authRoutes.js'
import homeRoutes from './routes/homeRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import categoryRouter from './routes/categoryRoutes.js'
import productRoutes from './routes/productRoutes.js'
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

app.use("/api/home", homeRoutes)
app.use("/api/carts", cartRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/roles", roleRouter)
app.use("/api/categories", categoryRouter)
app.use("/api/products", productRoutes)

app.listen(process.env.PORT, ()=>{
    dbConnection()
    console.log(`Server is runing in port ${process.env.PORT}`)
})