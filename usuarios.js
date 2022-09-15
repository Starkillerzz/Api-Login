const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const jwt = require('jsonwebtoken')
const pg = require('pg')

const pool = new pg.Pool({connectionString: process.env.DATABASE_URL /*, ssl: {rejectUnauthorized: false}*/})

router.get('/', (req, res) => {
    pool.connect((err, client, release) => {
      if(err){
        return res.send({message: 'Conexão não autorizada'})
      }
      var sql = "SELECT * FROM usuarios;"
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
      var sql = `DELETE FROM usuarios WHERE id = ${idcontato};`
      client.query(sql, (err, result)=> {
        res.send({message: "Contato excluído com sucesso!"})
      })
      release()
    })
})

router.post('/', (req, res, release) => {
    pool.connect((err, client) => {
        if (err) {
            return res.status(401).send({message:"Conexão não autorizada", erro: err.message})
        }
       client.query('select * from usuarios where email = $1', [req.body.email], (error, result) => {
            if (error) {
                return res.status(401).send('Operação não autorizada')
            }

            if (result.rowCount > 0) {
                return res.status(200).send('Registro já existe')
            }
            bcrypt.hash(req.body.senha, 10, (error, hash) => {              
                var sql = 'insert into usuarios(nome, email, senha, perfil) values ($1,$2,$3, $4)'
                client.query(sql, [req.body.nome, req.body.email, hash, req.body.perfil], (error, result) => {
                    release()
                    if (error) {
                        return res.status(403).send({message:'operação não permitida' , erro: error.message})
                    }
                    return res.status(201).send({
                        mensagem: 'criado com sucesso',
                        status: 201
                    })
                })
            })
        })
        
    })
})

router.post('/login', (req, res) => {
    pool.connect((err, client, release) => {
        if (err) {
            return res.status(401).send({message:"Conexão não autorizada", erro: err.message})
        }
        client.query('select * from usuarios where email = $1', [req.body.email], (error, result) => {
            release()
            if (error) {
                return res.status(401).send('operação não permitida')
            }
            if (result.rowCount > 0) {
                //cripotgrafar a senha enviada e comparar com a recuperada do banco
                bcrypt.compare(req.body.senha, result.rows[0].senha, (error, results) => {
                    if (error) {
                        return res.status(401).send({
                            message: "Falha na autenticação"
                        })
                    }
                    if (results) { //geração do token
                        let token = jwt.sign({
                                email: result.rows[0].email,
                                perfil: result.rows[0].perfil
                            },
                            process.env.JWTKEY, { expiresIn: '1h' })
                        return res.status(200).send({
                            message: 'Conectado com sucesso',
                            token: token
                        })
                    }
                })
            } else {
                return res.status(200).send({
                    message: 'usuário não encontrado'
                })
            }
        })
    })
})

module.exports = router