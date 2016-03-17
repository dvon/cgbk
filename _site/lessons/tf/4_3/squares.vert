attribute vec3 position;
uniform float scaleFactor;
uniform float xTranslation;

void main(void) {
    vec3 scaledPosition, translatedPosition;

    scaledPosition = vec3(position.x * scaleFactor,
            position.y * scaleFactor, position.z * scaleFactor);

    translatedPosition = vec3(scaledPosition.x + xTranslation,
            scaledPosition.yz);

    gl_Position = vec4(translatedPosition.x * (3.0 / 4.0),
            translatedPosition.yz, 1.0);
}
