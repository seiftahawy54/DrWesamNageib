import mongoose from "mongoose";
import * as dotenv from "dotenv";


dotenv.config();
const db = mongoose.connection;

db.on('connect', () => {
    console.log('database connection success')
})

db.on('error', (error) => {
    console.error(`database error ${error}`)
})

db.closeConnection = () => {
    return mongoose.connection.close()
}

export default {
    db,
    connect: () => mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true})
}
