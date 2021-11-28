import { vec3, mat4 } from '../lib/gl-matrix-module.js';

import { Utils } from './Utils.js';
import { Node } from './Node.js';
import Functions from "./Functions.js";

export class Camera extends Node {

    constructor(options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);

        this.projection = mat4.create();
        this.updateProjection();
        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};
        this.jmpSpeed = 7;
        this.dBug = false;
        this.enbl = false;
    }

    updateProjection() {
        mat4.perspective(this.projection, this.fov, this.aspect, this.near, this.far);
    }

    update(dt) {
        const c = this;

        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const forwardB = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1])*0.5, 0, -Math.cos(c.rotation[1])*0.5);
        const right = vec3.set(vec3.create(),
            Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));


        // 1: add movement acceleration
        /*if(this.jmpSpeed <= 0){
            this.jmp = 0;
            this.jmpSpeed = 8;
            //console.log("ok dost bo")
        }*/

        const up = vec3.set(vec3.create(),
            0, this.jmpSpeed, 0);
        let acc = vec3.create();

        if(this.keys['KeyK']){
            this.dBug = !this.dBug
            this.jmp = 0;
            this.jmpSpeed = 10;
        }
        if (this.keys['KeyW']) {
            if(blasting){
                vec3.add(acc, acc, forwardB);
            }else{
                vec3.add(acc, acc, forward);
            }
        }
        if (this.keys['KeyS']) {
            if(blasting){
                vec3.sub(acc, acc, forwardB);
            }else{
                vec3.sub(acc, acc, forward);
            }
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }
        if (this.keys['ShiftLeft'] && this.dBug) {
            vec3.sub(acc,acc,up);
        }
        if (this.keys['ShiftLeft'] && !this.dBug) {
            console.log("ja halo?")
            c.maxSpeed = 1.5
        }else {
            c.maxSpeed = 5
        }
        if(this.keys['Space'] && this.dBug){
            vec3.add(acc,acc,up);
            console.log("dbug")
        }


        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

        // 3: if no movement, apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'] &&
            jmpable)
        {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }
        if(blasting){
            c.maxSpeed = 15;
        }
        if(jmpable){
            blasting = false;
        }

        if(this.keys['Space'] && !this.dBug && jmpable){
            //console.log(this.velocity)
            c.velocity[1] = this.jmpSpeed;
            jmpable = false;
        }

        // 4: limit speed

        const len = Math.hypot(c.velocity[0], c.velocity[2])
        if (len > c.maxSpeed) {
            c.velocity[0] *= c.maxSpeed / len
            c.velocity[2] *= c.maxSpeed / len
        }
       /* if(c.velocity[1] < -c.maxSpeedY){
            c.velocity[1] = -c.maxSpeedY
        }*/


    }

    enable() {
        this.enbl = true;
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable() {
        this.enbl = false;
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    mousemoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;
        const c = this;

        c.rotation[0] -= dy * c.mouseSensitivity;
        c.rotation[1] -= dx * c.mouseSensitivity;

        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;

        if (c.rotation[0] > halfpi) {
            c.rotation[0] = halfpi;
        }
        if (c.rotation[0] < -halfpi) {
            c.rotation[0] = -halfpi;
        }

        c.rotation[1] = ((c.rotation[1] % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

}

Camera.defaults = {
    aspect           : 1,
    fov              : 1.5,
    near             : 0.01,
    far              : 100,
    velocity         : [0, 0, 0],
    mouseSensitivity : 0.002,
    maxSpeed         : 5,
    maxSpeedY        : 50,//todo terminal velocity
    friction         : 0.2,
    acceleration     : 20
};
