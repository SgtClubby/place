import { MongoClient } from "mongodb";
import { WithId, Document } from "mongodb"
let uri = "mongodb://localhost:27017";



const client = new MongoClient(process.env.MONGODB_URI);

const db = client.db("place")
const collection = db.collection("canvas")
// client.connect()

type Color = {
    r: number,
    g: number,
    b: number
}

type PixelQuery = {
    x: number,
    y: number
}

export default class DB {
    constructor() {
        client.connect(err => {
            if (err) {
                console.log(err)
            }
        })
    }
    async updatePixel(query: PixelQuery, color: Color) {
        return await collection.updateOne(query, {$set: {color: {r: color.r, g: color.g, b: color.b}}})
    }

    async getCanvas() {
        return await collection.find({}, {projection: {_id: 0}}).toArray()
    }
}




