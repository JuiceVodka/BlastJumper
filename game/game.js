import { GUI } from '../lib/dat.gui.module.js';

import { Application } from '../common/engine/Application.js';

import { Renderer } from './Renderer.js';
import { Physics } from './Physics.js';
import { Camera } from './Camera.js';
import { SceneLoader } from './SceneLoader.js';
import { SceneBuilder } from './SceneBuilder.js';

import Functions from './Functions.js';

let loaded=false;

class App extends Application {

    start() {
        const gl = this.gl;

        this.renderer = new Renderer(gl);
        this.time = Date.now();
        this.startTime = this.time;
        this.aspect = 1;

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);

        this.load('game/scene.json');
    }

    async load(uri) {
        const scene = await new SceneLoader().loadScene(uri);
        const builder = new SceneBuilder(scene);
        this.scene = builder.build();
        this.physics = new Physics(this.scene);
        this.physics.missile = this.physics.missile.bind(this.physics)

        window.addEventListener("mousedown", this.physics.missile)

        this.funct = new Functions(this.scene);

        // Find first camera.
        this.camera = null;
        this.scene.traverse(node => {
            if (node instanceof Camera) {
                this.camera = node;
            }
            
        });

        this.camera.aspect = this.aspect;
        this.camera.updateProjection();
        this.renderer.prepare(this.scene);


        loaded = true;
    }


    enableCamera() {
        this.canvas.requestPointerLock();
    }

    pointerlockchangeHandler() {
        if (!this.camera) {
            return;
        }

        if (document.pointerLockElement === this.canvas) {
            this.camera.enable();
        } else {
            this.camera.disable();
        }
    }

    update() {
        if(!loaded){
            return;
        }
        const t = this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        if (this.camera) {
            this.camera.update(dt);
        }

        if (this.physics) {
            this.physics.update(dt);
        }

        let secondplat = this.funct.findById("movepyramid2");
        //console.log(secondplat[0]);
        if(secondplat[0].translation[1]>12){
            secondplat[0].direction =1;
        } else if(secondplat[0].translation[1]<6){
            secondplat[0].direction=0;
        }
        if(secondplat[0].direction==0){
            secondplat[0].translation[1]+=0.01;
        } else if(secondplat[0].direction==1) {
            secondplat[0].translation[1]-=0.01;
        }
        secondplat[0].updateTransform();

        let firstplat = this.funct.findById("movepyramid1");
        if(firstplat[0].translation[0]>12){
            firstplat[0].direction =1;
        } else if(firstplat[0].translation[0]<6){

            firstplat[0].direction=0;
        }
        if(firstplat[0].direction==0){
            if(this.funct.checkColision(this.camera,firstplat[0])){
                this.camera.translation[0]+=0.01;
            }
            firstplat[0].translation[0]+=0.01;
        } else if(firstplat[0].direction==1) {
            if(this.funct.checkColision(this.camera,firstplat[0])){
                this.camera.translation[0]-=0.01;
            }
            firstplat[0].translation[0]-=0.01;
        }
        firstplat[0].updateTransform();

        let propeller = this.funct.findById("propeller");
        propeller[0].rotation[1]+=0.05;
        propeller[0].updateTransform();

        let button1 = this.funct.findById("touchplate1");
        let button2 = this.funct.findById("touchplate2");
        let ladder = this.funct.findById("ladder");
        let bridge = this.funct.findById("ironcrate3");
        if(this.funct.checkColision(this.camera,button1[0])){
            console.log("button1!");
            if(button1[0].direction==0){
                button1[0].translation[1]-=0.08;
                button1[0].updateTransform();
                button1[0].direction=1;
            }
        }
        if(this.funct.checkColision(this.camera,button2[0])){
            console.log("button2!");
            if(button2[0].direction==0){
                button2[0].translation[1]-=0.08;
                button2[0].updateTransform();
                button2[0].direction=1;
            }
        }
        if(button2[0].direction==1 && button1[0].direction==1){
            bridge[0].direction=1;
        }
        if(bridge[0].direction==1){
            bridge[0].translation[1]=1;
            bridge[1].translation[1]=3;
            bridge[0].updateTransform();
            bridge[1].updateTransform();
        }
        if(this.funct.checkColision(this.camera,ladder[0]) && button2[0].direction==1 && button1[0].direction==1){
            console.log("ladder!");
        }
    }

    render() {
        if (this.scene) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.aspect = w / h;
        if (this.camera) {
            this.camera.aspect = this.aspect;
            this.camera.updateProjection();
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    //const gui = new GUI();
    //gui.add(app, 'enableCamera');
    canvas.onclick = function (){
        app.enableCamera();
    }
    //todo esc menu
});
