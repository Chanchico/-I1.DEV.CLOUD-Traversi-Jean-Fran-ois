import {object} from "prop-types";

export class Utils {

    // static isRessouceNotNull(ressource: object) : boolean{
    //     // Must return true if not null
    //     return ressource != null
    // }

    static formatTextOfRessourceUndifined(binairy: boolean) : string{
        if (!binairy) {
            return "The requested resource cannot be found."
        }
    }
}