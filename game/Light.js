import { Node } from './Node.js';

export class Light extends Node {

    constructor() {
        super();

        Object.assign(this, {
            position         : [0.2, 7, 0],
            ambientColor     : [100, 100, 100],
            diffuseColor     : [204, 204, 204],
            specularColor    : [255, 255, 255],
            shininess        : 10,
            attenuatuion     : [1.0, 0, 0.02]
        });
    }

}