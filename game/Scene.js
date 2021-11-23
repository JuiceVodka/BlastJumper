export class Scene {

    constructor() {
        this.nodes = [];
        this.scene = [];
    }

    addNode(node) {
        this.nodes.push(node);
    }

    traverse(before, after) {
        this.nodes.forEach(node => node.traverse(before, after));
    }

    

}
