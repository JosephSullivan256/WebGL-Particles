import {vec2, vec3, vec4, mat4} from "gl-matrix";

// //position = vector
// //direction = rotation matrix
// function Camera(position0,direction0){
//     this.position = position0;
//     this.rotation = direction0;
//     let viewMatrix = mat4.create();

//     this.getViewMatrix = function(){
//         let rotation = 
//         viewMatrix = mat4.fromRotationTranslation(viewMatrix,rotation,position);
//     }
// }

export function OrbitingCamera(position0,center0,up0=vec3.fromValues(0,1,0)){
    this.position = position0;
    this.center = center0;
    this.up = up0;
    this.rotation = [0,0];
    let matrix = mat4.create();

    this.getViewMatrix = function(){
        let transformedPos = vec3.create();
        let xrot = mat4.create();
        mat4.fromXRotation(xrot,this.rotation[1]);
        let yrot = mat4.create();
        mat4.fromYRotation(yrot,this.rotation[0]);
        let rot = mat4.create();
        mat4.multiply(rot,yrot,xrot);
        vec3.transformMat4(transformedPos,this.position,rot);

        mat4.lookAt(matrix,transformedPos,this.center,this.up);
        return matrix;
    }

    this.rotate = function(rotation){
        vec2.add(this.rotation,rotation,this.rotation);
        this.rotation[1] = Math.max(Math.min(this.rotation[1],Math.PI/2.0),-Math.PI/2.0)
    }

    this.scale = function(k){
        let diff = vec3.create();
        vec3.subtract(diff, this.position, this.center);
        vec3.scaleAndAdd(this.position,this.center,diff,k);
    }
}