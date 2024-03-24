import {MongoUtils} from "../../utils/mongoUtils";
const collection = "movies";
import {Utils} from "../../utils/utils"

/**
 * @swagger
 * tags:
 *   name: Movies
 *   summary: Movie Manager
 * /api/movies:
 *   get:
 *      summary: Get movies
 *      description: Returns movies
 *      tags: [Movies]
 *      responses:
 *        200:
 *          description: 10 first movies founded
 *   post:
 *     tags: [Movies]
 *     summary: Create a new movie
 *     description: Endpoint to create a new movie.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: movie
 *         description: The movie object to create.
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - plot
 *             - genres
 *             - runtime
 *             - cast
 *             - num_mflix_comments
 *             - poster
 *             - title
 *             - fullplot
 *             - countries
 *             - released
 *             - directors
 *             - writers
 *             - awards
 *             - lastupdated
 *             - year
 *             - imdb
 *             - type
 *             - tomatoes
 *             - languages
 *             - rated
 *           properties:
 *             plot:
 *               type: string
 *             genres:
 *               type: array
 *               items:
 *                 type: string
 *             runtime:
 *               type: integer
 *             cast:
 *               type: array
 *               items:
 *                 type: string
 *             num_mflix_comments:
 *               type: integer
 *             poster:
 *               type: string
 *             title:
 *               type: string
 *             fullplot:
 *               type: string
 *             countries:
 *               type: array
 *               items:
 *                 type: string
 *             released:
 *               type: string
 *               format: date-time
 *             directors:
 *               type: array
 *               items:
 *                 type: string
 *             writers:
 *               type: array
 *               items:
 *                 type: string
 *             awards:
 *               type: object
 *               properties:
 *                 wins:
 *                   type: integer
 *                 nominations:
 *                   type: integer
 *                 text:
 *                   type: string
 *             lastupdated:
 *               type: string
 *               format: date-time
 *             year:
 *               type: integer
 *             imdb:
 *               type: object
 *               properties:
 *                 rating:
 *                   type: number
 *                 votes:
 *                   type: integer
 *                 id:
 *                   type: integer
 *             type:
 *               type: string
 *             tomatoes:
 *               type: object
 *               properties:
 *                 viewer:
 *                   type: object
 *                   properties:
 *                     rating:
 *                       type: number
 *                     numReviews:
 *                       type: integer
 *                     meter:
 *                       type: integer
 *                 fresh:
 *                   type: integer
 *                 critic:
 *                   type: object
 *                   properties:
 *                     rating:
 *                       type: number
 *                     numReviews:
 *                       type: integer
 *                     meter:
 *                       type: integer
 *                 rotten:
 *                   type: integer
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 *             languages:
 *               type: array
 *               items:
 *                 type: string
 *             rated:
 *               type: string
 *     responses:
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
 *                   idMovie:
 *                     type: string
 *                     example: 65fc8bc6fbc23f134200fdd9
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
 *
 */



export default async function handler(req, res) {
    const connection = await MongoUtils.connectDb()
    const method = req.method


    switch (method){
        case 'GET':
            const movies = await connection.collection(collection).find().limit(10).toArray();
            res.status(200).json({ data: movies });
            break
        case 'POST':
            // Attention il ne faut pas qu'il y est l'id dans le req body
            try {
                Utils.MovieCheckerStruct(req.body);
                const statusMongo = await MongoUtils.createDocument(connection, collection, req.body);
                res.status(201).json({ message: Utils.messageCreatedModel('movie'), idMovie: statusMongo.insertedId });
            } catch (error) {
                res.status(400).json({ message: error.message });
            }

            break
    }

}