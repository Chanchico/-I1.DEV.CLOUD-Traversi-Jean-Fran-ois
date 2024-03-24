import {MongoUtils} from "../../../utils/mongoUtils";
import {Utils} from "../../../utils/utils";

const collection  = "movies";


/**
 * @swagger
 * tags:
 *   name: Movies
 *   summary: Movie Manager
 * /api/movie/{idMovie}:
 *   get:
 *      summary: Get movie requested
 *      description: Returns the movie requested
 *      tags: [Movies]
 *      parameters:
 *         - in: path
 *           name: idMovie
 *           required: true
 *           example: 65fc8bc6fbc23f134200fdd9
 *      responses:
 *        200:
 *          description: The movie founded
 *          content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   movie:
 *                     type: object
 *                     description: see the get movies request to structure
 *
 *
 *   put:
 *     tags: [Movies]
 *     summary: update movie
 *     description:  update the movie past in path parameter
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         example: 65fc8bc6fbc23f134200fdd9
 *       - in: body
 *         name: any_field_of_movie
 *         required: true
 *         description: Put an object json with existant field of movie, you can add many of them on the request
 *         schema:
 *           type: object
 *           properties:
 *             plot:
 *               type: string
 *             runtime:
 *               type: integer
 *
 *
 *     responses:
 *
 *       200:
 *          description: Successfully
 *          content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Information about state
 *                     example: The movie haven been inserted in database
 *
 *       208:
 *          description: The code is for nothing updated
 *          content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Information about state
 *                     example: The requested resource cannot be found.
 *
 *       405:
 *          description: An error has occurred.
 *          content:
 *             application/json:
 *                schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Information about the error
 *                     example: The 'year' field must be a number.
 *       404:
 *          description: Not Found
 *          content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: The requested resource cannot be found.
 */

export default async function movieManager(req, res){
    const connection = await MongoUtils.connectDb();
    const {idMovie} = req.query;
    // TODO refacto this
    try {
        Utils.errorIdThrown(idMovie);
    } catch (error){
        res.status(404).json({message: error.message})
        return
    }
    const method = req.method;
    const movie = await MongoUtils.findDocumentById(connection, collection, idMovie );
    const docFound = movie != null;
    if(!docFound){
        res.status(404).json({message: Utils.formatTextOfRessourceUndifined(docFound)});
    } else {
        switch (method) {
            case 'GET':
                res.status(200).json({
                    data: movie
                });
                break
            case 'PUT':
                try {
                    Utils.checkMovieOnUpdate(req.body);

                    const mongoResp = await MongoUtils.updateDocument(connection, collection, idMovie, req.body);
                    if (mongoResp.modifiedCount === 0) {
                        res.status(200).json({message: Utils.messageNothingUpdated()});
                    } else {
                        res.status(200).json({message: Utils.messageUpdatedModel("movie")});
                    }

                } catch (error) {
                    res.status(405).json({status: 405, 'method': method, data: error.message})
                }
                // Attention il ne faut pas qu'il y est l'id dans le req body
                break
            case 'DELETE':
                const mongoResp = MongoUtils.deleteDocument(connection, collection, idMovie)
                if(mongoResp.deleCounte === 1 ){
                    res.status(200).json({message: Utils.messageDeletedModel('movie')});
                } else {
                    res.status(500).json({message: Utils.messageErrorUnknow()});
                }
                break
        }
    }
}