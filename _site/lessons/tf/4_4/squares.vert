attribute vec3 position;
uniform float scaleFactor;
uniform float xTranslation;

void main(void) {
    vec3 translatedPosition, scaledPosition;

    translatedPosition = vec3(position.x + xTranslation,
            position.yz);

    scaledPosition = vec3(translatedPosition.x * scaleFactor,
            translatedPosition.y * scaleFactor,
            translatedPosition.z * scaleFactor);

    gl_Position = vec4(scaledPosition.x * (3.0 / 4.0),
            scaledPosition.yz, 1.0);
}
