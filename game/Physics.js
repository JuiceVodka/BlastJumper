import { vec3, mat4 } from '../lib/gl-matrix-module.js';
import  Functions  from './Functions.js'

export class Physics {

    constructor(scene) {
        this.scene = scene;
        this.funct = new Functions(this.scene);
    }

    update(dt) {
        let vertColison = false;
        let cam = this.funct.findCamera();
        this.scene.traverse(node => {
            if (node.velocity) {
                vec3.scaleAndAdd(node.translation, node.translation, node.velocity, dt);
                node.updateTransform();
                this.scene.traverse(other => {
                    if (node !== other) {
                        let coliding = this.resolveCollision(node, other);
                        if(coliding && other.velocity){
                            //todo premaknemo se nas
                        }
                        if(node == cam){
                            vertColison = vertColison || coliding
                        }
                    }
                });
            }
        });
        if(!vertColison){
            jmpable = false
            this.fall(cam)
        }else{
            accM = 0;
            jmpable = true;
        }
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    resolveCollision(a, b) {
        // Update bounding boxes with global translation.
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

        if (!isColliding) {
            return(false);
        }

        // Move node A minimally to avoid collision.
        const diffa = vec3.sub(vec3.create(), maxb, mina);
        const diffb = vec3.sub(vec3.create(), maxa, minb);

        let minDiff = Infinity;
        let minDirection = [0, 0, 0];
        if (diffa[0] >= 0 && diffa[0] < minDiff) {
            minDiff = diffa[0];
            minDirection = [minDiff, 0, 0];
        }
        if (diffa[1] >= 0 && diffa[1] < minDiff) {
            minDiff = diffa[1];
            minDirection = [0, minDiff, 0];
        }
        if (diffa[2] >= 0 && diffa[2] < minDiff) {
            minDiff = diffa[2];
            minDirection = [0, 0, minDiff];
        }
        if (diffb[0] >= 0 && diffb[0] < minDiff) {
            minDiff = diffb[0];
            minDirection = [-minDiff, 0, 0];
        }
        if (diffb[1] >= 0 && diffb[1] < minDiff) {
            minDiff = diffb[1];
            minDirection = [0, -minDiff, 0];
        }
        if (diffb[2] >= 0 && diffb[2] < minDiff) {
            minDiff = diffb[2];
            minDirection = [0, 0, -minDiff];
        }

        vec3.add(a.translation, a.translation, minDirection);
        a.updateTransform();
        if(minDirection[1] > 0){
            return(true)
        }
        return(false)
    }

    fall(a){
        accM += 0.03;
        a.velocity[1] -= accM
        a.updateTransform();
    }

    missile(e){
        accM = 0;
        console.log("bombs away")
        let cam = this.funct.findCamera();
        if (cam.enbl == true) {
            let rocket = this.funct.findById("raketa");
            let rotation = cam.rotation.slice();
            console.log(rocket.rotation)
            rocket[0].rotation = rotation;
            let pitch = rotation[0];
            let roll = 0;
            let yaw = rotation[1];

            let velocity_y = Math.sin(rotation[0]);
            let velocity_x = Math.sin(rotation[1]) * Math.cos(rotation[0]);
            let velocity_z = Math.cos(rotation[1]) * Math.cos(rotation[0]);
//
            //let velocity_x = -Math.cos(yaw)*Math.sin(pitch)*Math.cos(roll)+Math.sin(yaw)*Math.sin(roll);
            //let velocity_y = -Math.sin(yaw)*Math.sin(pitch)*Math.cos(roll)-Math.cos(yaw)*Math.sin(roll);
            //let velocity_z = Math.cos(pitch)*Math.sin(roll);

            //let velocity_x = - Math.cos(yaw) * Math.sin(pitch) * Math.sin(roll)- Math.sin(yaw) * Math.cos(roll);
            //let velocity_y = - Math.sin(yaw) * Math.sin(pitch) * Math.sin(roll) + Math.cos(yaw) * Math.cos(roll);
            //let velocity_z = Math.cos(pitch) * Math.sin(roll);
            const factor = 30;
            rocket[0].velocity = [-velocity_x * factor, velocity_y * factor, -velocity_z * factor]//[velocity_x, velocity_y, velocity_z];
            rocket[0].translation = cam.translation.slice();
            console.log(rotation);
            rocket[0].updateTransform();

            //move camera in other direction
            //cam.friction = 0.03;
            const v_factor = 20;
            cam.velocity = [velocity_x * v_factor, - velocity_y * v_factor, velocity_z * v_factor];
            cam.updateTransform();
        }
    }

}