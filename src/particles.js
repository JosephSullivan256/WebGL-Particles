import {vec3, mat4} from "gl-matrix";
import * as util from "./webgl_util.js";

export function ParticlesModel(){
	const src = {
		vs: `
			precision highp float;

			attribute vec2 aVertexPosition;

			varying vec2 pos;
			
			void main() {
				pos = aVertexPosition;
				gl_Position = vec4(aVertexPosition,0.0,1.0);
			}
		`,
		fs: `
			precision mediump float; //sets medium precision (should be supported on pretty much all mobile)
			
			varying vec2 pos;

			uniform float uTime;
			uniform mat4 transform;
			uniform vec3 particles[20];

			#define PI 3.1415926535897932384626433832795
			void main() {
				vec3 dir = normalize(vec3(pos,-1.0));

				// constants
				float a = 0.3;
				float a2 = dot(a,a);

				float weight = 0.0;
				for(int i = 0; i < 20; i++) {
					vec3 p = (transform*vec4(particles[i],1.0)).xyz;
					float p2 = dot(p,p);
					float dp = dot(dir,p);
					float k = sqrt((p2+a2)-(dp*dp));
					float fx = atan(dp/(k*k));

					weight += (a2/k)*(PI/2.0 + fx);
				}
				gl_FragColor = vec4(clamp(weight*vec3(0.9,0.1,0.1),vec3(0.,0.,0.),vec3(1.,1.,1.)),1.0);
			}
		`
	};
	
	this.programInfo;
	this.buffers;
	this.time = 0;

	this.init = function(gl){
		//init program
		let shaderProgram = util.initShaderProgram(gl,src.vs,src.fs);
		this.programInfo = {
			program: shaderProgram,
			attribLocations: {
				vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
			},
			uniformLocations: {
				transform: gl.getUniformLocation(shaderProgram,'transform'),
				particles: gl.getUniformLocation(shaderProgram,'particles'),
				time: gl.getUniformLocation(shaderProgram,"uTime"),
			},
		}

		//init buffers
		let positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER,
			new Float32Array([
				-1.0,  1.0,
				 1.0,  1.0,
				-1.0, -1.0,
				 1.0, -1.0
			]),
			gl.STATIC_DRAW);
		
		let indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array([
				0,1,2,3,2,1
			]),
			gl.STATIC_DRAW);
		
		this.buffers = {
			position: positionBuffer,
			indices: indexBuffer,
		};

		this.initParticles(20,30.0);
	}

	this.initParticles = function(n,r){
		this.n = n;
		this.positions = new Float32Array(3*n);
		this.velocities = new Array(n);
		this.forces = new Array(n);

		for(let i = 0; i < n; i++){
			let pos = vec3.create(r);
			vec3.random(pos);
			this.positions[i*3 + 0] = pos[0];
			this.positions[i*3 + 1] = pos[1];
			this.positions[i*3 + 2] = pos[2];
			this.velocities[i] = vec3.create();
			this.forces[i] = vec3.create();
		}
	}

	this.update = function(dt){
		this.time+=dt;
		//dt*=0.0;

		// generate forces
		for(let i = 0; i < this.n; i++){
			for(let j = i+1; j < this.n; j++){
				let a = this.positions.slice(i*3,(i+1)*3);
				let b = this.positions.slice(j*3,(j+1)*3);

				let ab = vec3.create();
				vec3.subtract(ab,b,a);

				let r = vec3.length(ab);
				let mag1 = 1.2/(r*r*r);
				let mag2 = -0.1/(r*r*r*r*r);
				let mag = mag1+mag2;

				vec3.scale(this.forces[i], ab, mag);
				vec3.scale(this.forces[j], ab, -mag);
			}
		}

		// integrate acceleration
		for(let i = 0; i < this.n; i++){
			let dx = vec3.create();
			let dv = vec3.create();

			vec3.scale(dv,this.forces[i],dt);
			vec3.add(this.velocities[i],this.velocities[i],dv);
			vec3.zero(this.forces[i]);
			
			vec3.scale(dx,this.velocities[i],dt);
			this.positions[3*i+0] += dx[0];
			this.positions[3*i+1] += dx[1];
			this.positions[3*i+2] += dx[2];

			//console.log(`<${this.positions[3*i+0]},${this.positions[3*i+1]},${this.positions[3*i+2]}>`)
		}
	}
	
	this.render = function(gl,globalUniforms){
		// Tell WebGL how to pull out the positions from the position
		// buffer into the vertexPosition attribute.
		{
			const numComponents = 2;  // pull out 2 values per iteration
			const type = gl.FLOAT;    // the data in the buffer is 32bit floats
			const normalize = false;  // don't normalize
			const stride = 0;         // how many bytes to get from one set of values to the next
									  // 0 = use type and numComponents above
			const offset = 0;         // how many bytes inside the buffer to start from
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
			gl.vertexAttribPointer(
				this.programInfo.attribLocations.vertexPosition,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
		}

		// Tell WebGL which indices to use to index the vertices
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

		// Tell WebGL to use our program when drawing

		gl.useProgram(this.programInfo.program);

		// Set the shader uniforms
		gl.uniformMatrix4fv(
			this.programInfo.uniformLocations.transform,
			false,
			globalUniforms.camera.getViewMatrix());
		gl.uniform1f(
			this.programInfo.uniformLocations.time,
			this.time);
		gl.uniform3fv(
			this.programInfo.uniformLocations.particles,
			this.positions);
		
		{
			const offset = 0;
			const type = gl.UNSIGNED_SHORT;
			const vertexCount = 6;
			gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
		}
	}
}
