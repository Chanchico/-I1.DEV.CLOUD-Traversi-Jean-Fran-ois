import {MongoUtils} from "../../utils/mongoUtils";


export default async function handler(req: any, res: any) {
    const connection = await MongoUtils.connectDb()
    const movies = await connection.collection("movies").find({}).limit(10).toArray();
    res.json({ status: 200, data: movies });
}