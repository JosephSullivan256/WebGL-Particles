# WebGL-Particles

Some heckin' cool particles. See it [live](https://partiallyordered.com/projects/particles)!

## Rendering

The renderer is roughly speaking a ray-tracer, and it is implemented as a 
WebGL fragment shader.


### Scalar Field
First, we define a scalar field assigning a "density" to each point in
space. Formally, if the particles have positions `r1,...,rn`, and we want to
calculate the scalar field at a point `v`, the scalar value is given by the sum
of `1/(1+|v-ri|^2)`.

Each of these terms are big when `v` is close to the given `ri`, and each term
slowly fades to 0 as `v` gets far away. So, the scalar field represents how
much a particle fills a location `v` in space.

### Ray Tracing
Then, to render, I apply the same principles of ray tracing. To be able to do
ray tracing, I need to be able to calculate the "light" coming in along a ray.

Instead of following the rays backwards until they hit an object/light source,
I compute the line integral of the scalar field over this ray. Rather than doing
this numerically, I can actually explicitly find the integral. It turns out to
be `arctan` something or other.

![image](https://github.com/JosephSullivan256/WebGL-Particles/blob/master/particles.png?raw=true)


## Physics

On the physics side of things, each particle just has some sort of simple
gravitation (inverse square law), a nearby repulsion force to bullet through
paper sort of effects, and some ad-hoc friction.

I'm using something like verlet integration I guess? It's just doing euler's
method except averaging velocities instead of using initial/final velocity
in a timestep.