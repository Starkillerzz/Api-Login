const express = require('express')
const app = express()
const contatos = require("./contatos")
const usuarios = require("./usuarios")
const cors = require('cors')

const port = process.env.PORT
app.use (cors())
app.use(express.json())
app.use('/contatos', contatos)
app.use('/usuarios', usuarios)

app.listen(port, () => {
  console.log(`Executando em http://localhost:${port}`)
})