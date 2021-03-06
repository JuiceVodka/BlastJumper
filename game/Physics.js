import { vec3, mat4 } from '../lib/gl-matrix-module.js';
import { Camera } from './Camera.js';
import  Functions  from './Functions.js'

export class Physics {

    constructor(scene) {
        this.stTime = 0;
        this.eTime = 0;
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
                if (node.id == "particle") {
                    let end = new Date().getTime();
                    this.eTime = end - this.stTime;
                    if (this.eTime > 500) {
                        let p = this.funct.findById("particle");
                        for (let i = 0; i < p.length; i++) {
                            p[i].translation[0] = [0, -70, 0];
                            p[i].velocity = [0, 0, 0];
                            p[i].updateTransform();
                        }
                    }
                }
                this.scene.traverse(other => {
                    if (node !== other) {
                        let coliding = this.resolveCollision(node, other);
                        if(node == cam){
                            vertColison = vertColison || coliding;
                        }
                    }
                    /*if(other.id == "bazooka" && node == cam){
                        vec3.copy(other.translation, node.translation);
                        vec3.copy(other.rotation, node.rotation);
                        other.updateTransform();
                    }*/
                });
            }
        });
        if(!vertColison){
            jmpable = false
            this.fall(cam)
        }else{
            accM = 0;
            jmpable = true;
            if(crnch && !mute){
                crnch = false;
                crunch.play();
            }
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
        if(b.id == "bazooka" || a.id == "bazooka"){
            return false;
        }
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


        if (a.id == "raketa") {
            let cam = this.funct.findCamera();
            if (b == cam) {
                return (false);
            }
            let vx = a.velocity[0];
            let vy = a.velocity[1];
            let vz = a.velocity[2];

            let dist = Math.pow((a.translation[0] - cam.translation[0]), 2) +
                       Math.pow((a.translation[1] - cam.translation[1]), 2) + 
                       Math.pow((a.translation[2] - cam.translation[2]), 2);
            dist = Math.sqrt(dist)
            if(dist < 5){
                let v_factor = (1 / dist)*0.3;
                if(!jmpable){
                    v_factor = (1 / dist)*0.75;
                }
                //console.log(v_factor);
                cam.velocity = [-vx * v_factor, - vy * v_factor, -vz * v_factor];
                cam.updateTransform();
                blasting = true;
                accM = 0;
                crnch = false;
            }
            let distance = Math.pow((a.translation[0] - cam.translation[0]), 2) +
                Math.pow((a.translation[1] - cam.translation[1]), 2) +
                Math.pow((a.translation[2] - cam.translation[2]), 2);
            distance = Math.sqrt(distance);
            this.explode(a.translation);
            this.stTime = new Date().getTime();
            let bm = new Audio("../common/sounds/boom.mp3");
            let vol = 3/distance;
            if(vol > 1){
                bm.volume = 1;
            }else{
                bm.volume = vol;
            }
            console.log(mute);
            if(mute){
                bm.volume = 0;
            }
            bm.play();
            a.translation = [0, -150, 0];
            a.velocity = [0, 0, 0];
            a.updateTransform();
            return (true);
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
        accM += 0.02;
        a.velocity[1] -= accM
        a.updateTransform();
    }

    missile(e){
        let delay = 700;
        if(lastClick + delay < Date.now()){
            //console.log("bombs away")
            let cam = this.funct.findCamera();
            if (cam.enbl == true) {
                let rocket = this.funct.findById("raketa");
                let rotation = cam.rotation.slice();
                //console.log(rocket.rotation)
                rocket[0].rotation = rotation;
                let pitch = rotation[0];
                let roll = 0;
                let yaw = rotation[1]; //+ (Math.PI/2);

                let velocity_y = Math.sin(rotation[0]);
                let velocity_x = Math.sin(rotation[1]) * Math.cos(rotation[0]);
                let velocity_z = Math.cos(rotation[1]) * Math.cos(rotation[0]);
                //let velocity_x = -Math.cos(yaw)*Math.sin(pitch)*Math.cos(roll)+Math.sin(yaw)*Math.sin(roll);
                //let velocity_y = -Math.sin(yaw)*Math.sin(pitch)*Math.cos(roll)-Math.cos(yaw)*Math.sin(roll);
                //let velocity_z = Math.cos(pitch)*Math.sin(roll);

                //let velocity_x = - Math.cos(yaw) * Math.sin(pitch) * Math.sin(roll)- Math.sin(yaw) * Math.cos(roll);
                //let velocity_y = - Math.sin(yaw) * Math.sin(pitch) * Math.sin(roll) + Math.cos(yaw) * Math.cos(roll);
                //let velocity_z = Math.cos(pitch) * Math.sin(roll);
                const factor = 30;
                rocket[0].velocity = [-velocity_x * factor, velocity_y * factor, -velocity_z * factor]//[velocity_x, velocity_y, velocity_z];
                let trans = cam.translation.slice();
                rocket[0].velocity[0] *= 0.025
                rocket[0].velocity[1] *= 0.025
                rocket[0].velocity[2] *= 0.025
                vec3.add(trans, trans, rocket[0].velocity);
                rocket[0].velocity[0] *= 40
                rocket[0].velocity[1] *= 40
                rocket[0].velocity[2] *= 40
                //trans[1] = trans[1] + 0.5;
                rocket[0].translation = trans;
                //console.log(rotation);
                rocket[0].updateTransform();

                //move camera in other direction

                //const v_factor = 20;
                //cam.velocity = [velocity_x * v_factor, - velocity_y * v_factor, velocity_z * v_factor];
                //cam.updateTransform();
                lastClick = Date.now()
            }
        }
    }

    explode(pos) {
        let p = this.funct.findById("particle");
        let factor = 10;
        for (let i = 0; i < (p.length / 2); i++) {
            //p[i].translation = pos;
            let position = pos.slice();
            p[i].translation[0] = position[0] + Math.random();
            p[i].translation[1] = position[1] + Math.random();
            p[i].translation[2] = position[2] + Math.random();
            p[i].velocity = [Math.random() * factor, Math.random() * factor, Math.random() * factor];
            p[i].updateTransform();
            p[i].rotation = [Math.random(), Math.random(), Math.random()];
        }
        for (let i = (p.length / 2); i < p.length; i++) {
            //p[i].translation = pos;
            let position = pos.slice();
            p[i].translation[0] = position[0] + Math.random();
            p[i].translation[1] = position[1] + Math.random();
            p[i].translation[2] = position[2] + Math.random();
            factor = factor * -1;
            p[i].velocity = [Math.random() * factor, Math.random() * (-1) * factor, Math.random() * factor];
            p[i].updateTransform();
        }
    }

}