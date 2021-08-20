import {vec2, vec3, vec4, mat4} from "gl-matrix";
import * as camera from "./camera.js";
import {addEventsToElement} from "./mouse_events.js";
import {TestModel} from "./test_model.js";
import {ParticlesModel} from "./particles.js";

window.addEventListener("load",function(){
	main();
});

function main(){
	const canvas = document.getElementById("canvas");
	const gl = canvas.getContext("webgl", { premultipliedAlpha: false });
	if(gl===null){
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}
	
	let mouseInfo = addEventsToElement(canvas);
	
	let model = new ParticlesModel();
	model.init(gl);

	let scene = new Scene(new GlobalUniforms(gl),[model]);

	let dt = 0;
	let then = 0;
	
	function loop(now){
		now *= 0.001;
		dt = now-then;
		then = now;

		updateScene(scene,dt,mouseInfo);
		drawScene(gl,scene);
		window.requestAnimationFrame(loop);
	}
	window.requestAnimationFrame(loop);
}

function updateScene(scene,dt,mouseInfo){
	scene.update(dt);
	if(mouseInfo.down){
		scene.globalUniforms.camera.rotate([-dt*mouseInfo.vel[0],dt*mouseInfo.vel[1]]);
		mouseInfo.vel = [0,0];
	}
	if(mouseInfo.scrolldelta != 0.0){
		if(mouseInfo.scrolldelta>0){
			scene.globalUniforms.camera.scale(1.1);
		} else {
			scene.globalUniforms.camera.scale(0.9);
		}
		mouseInfo.scrolldelta = 0.0;
	}
}

function drawScene(gl,scene){
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	scene.render(gl);
}

function Scene(globalUniforms,models=[]){
	this.globalUniforms = globalUniforms;
	this.models = models;
	this.update = function(dt){
		models.forEach(model => model.update(dt));
	}
	this.render = function(gl){
		models.forEach(model => {
			model.render(gl,globalUniforms);
		});
	}
}

function GlobalUniforms(gl){
	this.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

	this.camera = new camera.OrbitingCamera([0.0,0.0,-10.0],[0.0,0.0,0.0]);
}

/*
setup:

create programs and lookup attribute and uniform locations
create buffers
create texture


drawing:

for each model
  for each attribute
    bindBuffer(ARRAY_BUFFER, model's buffer for attribute)
    vertexAttribPointer(...)
  bindBuffer(ELEMENT_ARRAY_BUFFER, model's ebo)
  set uniforms and bind textures 
  glDrawElements
*/