// This class contains methods to perform some redundant operations.

export class Utils {

    static  movieAttribute = ['plot', 'genres', 'runtime', 'cast', 'num_mflix_comments', 'poster', 'title',
                                        'fullplot', 'countries', 'released', 'directors', 'writers', 'awards',
                                        'lastupdated', 'year', 'imdb', 'type', 'tomatoes', 'languages', 'rated'
                                        ];

    static commentsAttribute = [
        "name", "email", "movie_id", "text", "date"
    ]

    static formatTextOfRessourceUndifined() {

            return "The requested resource cannot be found."

    }

    static MovieCheckerStruct(json){
        for (const attribute of Utils.movieAttribute) {
            if (!(attribute in json)) {
                throw new Error(`Missing attribute in the JSON object: ${attribute}`);
            }
        }
        Utils.checkMovieType(json)
    }

    static checkMovieType(json){
        for (const key in json){
            if(!Utils.movieAttribute.includes(key)){
                throw new Error(`The attribute: ${key}, should not exist `);
            }
            switch (key) {
                case 'plot':
                    if(typeof json.plot !== 'string'){
                        throw new Error("The 'plot' field must be a string.");
                    }
                    break
                case 'fullplot':
                    if (typeof json.fullplot !== 'string') {
                        throw new Error("The 'fullplot' field must be a string.");
                    }
                    break
                case 'poster':
                    if (typeof json.poster !== 'string') {
                        throw new Error("The 'poster' field must be a string.");
                    }
                    break
                case 'title':
                    if (typeof json.title !== 'string') {
                        throw new Error("The 'title' field must be a string.");
                    }
                    break
                case 'released':
                    if (typeof json.released !== 'string') {
                        throw new Error("The 'released' field must be a string.");
                    }
                    break
                case 'lastupdated':
                    if (typeof json.lastupdated !== 'string') {
                        throw new Error("The 'lastupdated' field must be a string.");
                    }
                    break
                case 'type':
                    if (typeof json.type !== 'string') {
                        throw new Error("The 'type' field must be a string.");
                    }
                    break
                case 'rated':
                    if (typeof json.rated !== 'string') {
                        throw new Error("The 'rated' field must be a string.");
                    }
                    break;
                case 'genres':
                    if (!Array.isArray(json.genres)) {
                        throw new Error("The 'genres' field must be an array.");
                    }
                    break
                case 'cast':
                    if (!Array.isArray(json.cast)) {
                        throw new Error("The 'cast' field must be an array.");
                    }
                    break
                case 'countries':
                    if (!Array.isArray(json.countries)) {
                        throw new Error("The 'countries' field must be an array.");
                    }
                    break
                case 'directors':
                    if (!Array.isArray(json.directors)) {
                        throw new Error("The 'directors' field must be an array.");
                    }
                    break
                case 'writers':
                    if (!Array.isArray(json.writers)) {
                        throw new Error("The 'writers' field must be an array.");
                    }
                    break
                case 'languages':
                    if (!Array.isArray(json.languages)) {
                        throw new Error(`The '${field}' field must be an array of strings.`);
                    }
                    break;
                case 'runtime':
                    if (typeof json.runtime !== 'number') {
                        throw new Error("The 'runtime' field must be a number.");
                    }
                    break;
                case 'num_mflix_comments':
                    if (typeof json.num_mflix_comments !== 'number') {
                        throw new Error("The 'num_mflix_comments' field must be a number.");
                    }
                    break
                case 'year':
                    if (typeof json.year !== 'number') {
                        throw new Error("The 'year' field must be a number.");
                    }
                    break;
                case 'awards':
                    if (typeof json.awards !== 'object') {
                        throw new Error(`The 'awards' field must be a JSON object.`);
                    }
                    break
                case 'imdb':
                    if (typeof json.awards !== 'object') {
                        throw new Error(`The 'awards' field must be a JSON object.`);
                    }
                    break
                case 'tomatoes':
                    if (typeof json.awards !== 'object') {
                        throw new Error(`The 'awards' field must be a JSON object.`);
                    }
                    break

            }
        }
    }


    static checkMovieOnUpdate(json){
        Utils.checkMovieType(json)
    }

    static isValidObjectId(id) {
        if (typeof id !== 'string') {
            return false;
        }

        if (id.length !== 24) {
            return false;
        }

        const validHex = /^[0-9a-fA-F]+$/;
        return validHex.test(id);

    }

    static errorIdThrown(id){
        if( !Utils.isValidObjectId(id)){
            throw new Error("Argument passed in must be a string of a string of 24 hex characters")
        }
    }
    static messageCreatedModel(model){
        return `The ${model} have been inserted in database.`
    }

    static messageUpdatedModel(model){
        return `The ${model} have been updated in database.`
    }

    static messageNothingUpdated(){
        return "Nothing updated."
    }

    static messageErrorUnknow(){
        return "something went wrong during the processing of your request"
    }

    static messageDeletedModel(model){
        return `The ${model} have been removed of the database.`
    }

    static validEmail(email){
        const emailPattern = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email);
    }
    static  validDateTime(date) {
        const dateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        return dateTimePattern.test(date)
    }
    static checkCommentType(json ){
        for (const key in json){
            if(!Utils.commentsAttribute.includes(key)){
                throw new Error(`The attribute: ${key}, should not exist `);
            }
            switch (key) {
                case 'name':
                    if(typeof json.name !== 'string') {
                        throw new Error("The 'name' field must be a string.");
                    }
                    break
                case 'email':
                    if (typeof json.email !== 'string') {
                        throw new Error("The 'email' field must be a string.");
                    }
                    if (!Utils.validEmail(json.email)) {
                        throw new Error("The mail is not valid")
                    }
                    break
                case 'text':
                    if (typeof json.text !== 'string') {
                        throw new Error("The 'text' field must be a string.");
                    }
                    break
                case 'date':
                    if (typeof json.date !== 'string') {
                        throw new Error("The 'date' field must be a string.");
                    }
                    if (!Utils.validDateTime(json.date)) {
                        throw new Error("The format date is incorrect")
                    }
                    break


            }
        }
    }

    static checkerCommentStruct(json){
        for (const attribute of Utils.commentsAttribute) {
            if (!(attribute in json)) {
                throw new Error(`Missing attribute in the JSON object: ${attribute}`);
            }
        }
        Utils.checkCommentType(json)

    }

    static checkCommentOnUpdate(json){
        Utils.checkCommentType(json)
    }



}