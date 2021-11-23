import { Application } from '../common/engine/Application.js';

import {Renderer} from './Renderer.js';
import {Physics} from './Physics.js';
import { Camera } from './Camera.js';
import {SceneLoader} from './SceneLoader.js';
import {SceneBuilder} from './SceneBuilder.js';
import {Node} from './Node.js';
import { Model } from './Model.js';
import { Mesh } from './Mesh.js';

export default class Functions{

    constructor(sceneInput){
        this.scene = sceneInput;
        this.camera= this.findCamera();
    }

    findById(idF){
		var arr = [];
		if(this.scene){
            //console.log(this.scene);
	        this.scene.traverse(node => {
	            if(node.id == idF){
	            	arr.push(node);
                } /*else {
                    console.log(node);
                }*/
	        });
        }
        return arr;
	}

    findCamera(){
		var target = null;
		if(this.scene){
	        this.scene.traverse(node => {
	        	//console.log(node.type);
	            if(node instanceof Camera){
	            	target = node;
	            }	            
	        });
        }
        return target;
	}

}