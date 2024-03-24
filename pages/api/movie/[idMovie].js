import {MongoUtils} from "../../../utils/mongoUtils";
import {Utils} from "../../../utils/utils";
import {MongoClient, ObjectId} from "mongodb";
import {bidirectional_l} from "@mongodb-js/saslprep/dist/code-points-src";

const colletion  = "movies"
export default async function movieManager(req: any, res: any){
    const connection : MongoClient = await MongoUtils.connectDb()
    const {idMovie} = req.query
    const method = req.method
    const movies = await MongoUtils.findRessourceById(connection, colletion, idMovie )
    const binairy = movies != null
    switch (method){
        case 'GET':
            res.json({ status: 200, 'method': method, data: binairy ? movies : Utils.formatTextOfRessourceUndifined(binairy) });
            break
        case 'PUT':
            const {plot} = req.body
            console.log(plot)
            res.json({ status: 200, 'method': method, data: binairy ? movies : Utils.formatTextOfRessourceUndifined(binairy) });
            break
        case 'DELETE':
            break
    }

}