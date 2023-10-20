require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const routes = require("./src/routes/index")
const errorHandlerMiddleware = require("./src/common/middleware/error-handler.middleware");
require("./src/models/index")
const path = require("path")

app.get('/', (req, res) => res.send('Hello World!'))
app.use(express.json());
app.use("/api/v1", routes)
app.use('/public', express.static(path.join(__dirname, 'public')));


app.use(errorHandlerMiddleware);
app.listen(port, () => {
    console.log(`Sever is running on ${port}!`)
})
