const express = require('express')
const router = express.Router()
const pg = require('pg')

const pool = new pg.Pool({connectionString: process.env.DATABASE_URL})
  
  router.get('/', (req, res) => {
      pool.connect((err, client, release) => {
        if(err){
          return res.send({message: 'Conexão não autorizada'})
        }
        var sql = "SELECT * FROM contatos;"
        client.query(sql, (err, result)=> {
          res.send(result.rows)
        })
        release()
      })
    })

  router.delete('/:idcontato', (req, res) => {
      var idcontato = req.params.idcontato
      pool.connect((err, client, release) => {
        if(err){
          return res.send({message: 'Conexão não autorizada'})
        }
        var sql = `DELETE FROM contatos WHERE id = ${idcontato};`
        client.query(sql, (err, result)=> {
          res.send({message: "Contato excluído com sucesso!"})
        })
        release()
      })
  })
  
  router.get('/:idcontato', (req, res) => {
      var idcontato = req.params.idcontato
      pool.connect((err, client, release) => {
        if(err){
          return res.send({message: 'Conexão não autorizada'})
        }
        var sql = `SELECT * FROM contatos WHERE id = ${idcontato};`
        client.query(sql, (err, result)=> {
          res.send(result.rows[0])
        })
        release()
      })
  })
  
  router.post('/', (req, res) => {
      pool.connect((err, client, release) => {
        if(err){
          return res.send({message: 'Conexão não autorizada'})
        }
        var sql = "INSERT INTO contatos(nome, email, fone) VALUES($1, $2, $3);"
        var dados = [req.body.nome, req.body.email, req.body.fone]
        client.query(sql, dados, (erro, result)=> {
          if(erro){
            return res.send({message: "Erro ao salvar contato", erro: erro.message})
          }
          if(result.rowCount > 0){
            res.send({message: "Contato cadastrado com sucesso!"})
          }
        })
        release()
      })
  })

module.exports = router