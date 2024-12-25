export function createGl() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        return null;
    }

    return gl;
}

export function createDataTexture(
    gl: WebGL2RenderingContext,
    data: ArrayLike<number>,
    numComponents: number,
    internalFormat: GLenum,
    format: GLenum,
    type: GLenum,
    activeTexture: number,
) {
    const numElements = data.length / numComponents;

    // compute a size that will hold all of our data
    const width = Math.ceil(Math.sqrt(numElements));
    const height = Math.ceil(numElements / width);

    const bin = new Float32Array(width * height * numComponents);
    bin.set(data);

    const texture = gl.createTexture();
    gl.activeTexture(activeTexture);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        width,
        height,
        0,
        format,
        type,
        bin,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return {texture, dimensions: [width, height]};
}
