Perspective Transform
======

Practice assignment 3 and 4 for CAP 4720.

The assignment document for 3 was as follows:
- Use lookAt and perspective transformation to render the supplied objects.
- The supplied objects are each composed of an array of triangle meshes. Each mesh is defined by an array of vertex positions, optionally additional arrays containing other vertex attributes such as colors, normals, etc.. and optionally an array of indices defining the triangles of the mesh. In the absence of the index array, assume that three consecutive vertices in the vertex list define a triangle.
- Use lookAt and perspective functions defined in cuon-matrix.js (or any similar Math library).
- Set the default parameters for these two functions.

***

The assignment document for 4 was as follows:
- Extend your project 1 or Practice assignment 3 to render the object with its depth value. That means, in fragment shader use the depth (available as the Z-component of predefined vec3 variable gl_FragCoord) as the color.
- Provide interface to vary FOV, near plane distance (n), far plane distance (f) and see how the color changes. The "n" and "f" values should be a factor to the diagonal of the Object's bounding box. [3 points for the interface]
- Provide a screen shot of your rendered scene that shows the object with shade dark (fragment depth close to 0) to bright (fragment depth close 1).  So you must adjust the "n" and "f" values to create the appropriate appearance. [3 points]
- Compute and plot the depth value as a function of Z value from n to f. The curve drawing could be on a separate Canvas or could appear on the same canvas, above the top of the 3D rendering. [4 points]


Do not copy code without consent or use it for any purposes your mother wouldn't approve of.
-
