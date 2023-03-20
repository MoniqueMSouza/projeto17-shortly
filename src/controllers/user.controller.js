import { db } from "../database/database.js"
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'

export async function signup(req, res) {
  const { name, email, password } = req.body

  try {

    const existeUsuario = await db.query(`
        SELECT * FROM users WHERE email = $1
      `, [email])

    if (existeUsuario.rowCount > 0) return res.sendStatus(409)

    const passwordHash = bcrypt.hashSync(password, 10)

    await db.query(`
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
      `, [name, email, passwordHash])

    res.sendStatus(201)

  } catch (err) {
    console.log(err)
    res.status(500).send(err.message)
  }

}

export async function signin(req, res) {
  const { email, password } = req.body
  const token = uuid();


  const { rows: usuarios } = await db.query(`
    SELECT * FROM users WHERE email = $1
    `, [email])
    const [usuario] = usuarios

  if (!usuarios) return res.sendStatus(401)

  if (bcrypt.compareSync(password, usuario.password)){
    await db.query(`INSERT INTO sessions (token, "userId") VALUES ($1, $2)`, [token, usuario.id])

    return res.send ({token} )
  }
  res.sendStatus(401)
 
}
