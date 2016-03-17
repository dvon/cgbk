attribute vec3 position;
uniform float scaleFactor;

void main(void) {
    gl_Position = vec4(position.x * scaleFactor * (3.0 / 4.0),
            position.y * scaleFactor, position.z * scaleFactor, 1.0);
}
