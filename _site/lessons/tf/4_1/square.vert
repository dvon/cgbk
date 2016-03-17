attribute vec3 position;

void main(void) {
    gl_Position = vec4(position.x * (3.0 / 4.0), position.y,
            position.z, 1.0);
}
