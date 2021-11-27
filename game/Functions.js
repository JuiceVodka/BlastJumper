import { Application } from '../common/engine/Application.js';
import { vec3, mat4 } from '../lib/gl-matrix-module.js';
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
                }
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

	intervalIntersection(min1, max1, min2, max2) {
		return !(min1 > max2 || min2 > max1);
	}

	aabbIntersection(aabb1, aabb2) {
		return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
			&& this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
			&& this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
	}

	checkColision(a,b){
		const ta = a.getGlobalTransform();
		const tb = b.getGlobalTransform();

		const posa = mat4.getTranslation(vec3.create(), ta);
		const posb = mat4.getTranslation(vec3.create(), tb);

		const mina = vec3.add(vec3.create(), posa, a.aabb.min);
		const maxa = vec3.add(vec3.create(), posa, a.aabb.max);
		const minb = vec3.add(vec3.create(), posb, b.aabb.min);
		const maxb = vec3.add(vec3.create(), posb, b.aabb.max);

		// Check if there is collision.
		const isColliding = this.aabbIntersection({
			min: mina,
			max: maxa
		}, {
			min: minb,
			max: maxb
		});

		if(isColliding){
			return true;
		} else {
			return false;
		}
	}

}