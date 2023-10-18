
import * as dotenv from "dotenv";
import { Users } from "../models/index.js"

dotenv.config()

if (process.env.NODE_ENV === 'production') {
  process.exit(0)
}

const allUsers = await Users.findAll({})

for (let i = 0 ; i < allUsers.length; i++) {
  await Users.update(
    {
        password: "$2b$12$zs0Y93twgcIHewxeR0VV/OD0U6CsKlL9ZTyvtboJc8UUErKPpI5HO"
    },
    {
      where: {
        user_id: allUsers[i].user_id
      }
    }
  )
}
