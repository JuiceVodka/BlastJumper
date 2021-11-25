import { Node } from './Node.js';

export class Model extends Node {

    constructor(mesh, image, options) {
        super(options);
        this.mesh = mesh;
        this.image = image;
        if(options.id){
            this.id = options.id;
        }
        if(options.direction){
            console.log(options);
            this.direction = options.direction;
        }
    }

}