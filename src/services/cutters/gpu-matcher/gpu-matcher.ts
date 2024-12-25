import {createDataTexture, createGl} from "../../../helpers/gl.ts";
import * as twgl from "twgl.js";
import matcherShader from './shaders/matcher.vert?raw';
import stubShader from './shaders/stub.frag?raw';

function flatten<T>(arr: T[][][]): T[] {
    const result = [];

    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length - 1; j++) {
            for (let k = 0; k < arr[i][j].length; k++) {
                result.push(arr[i][j][k]);
            }
        }
    }

    return result;
}

function getDescriptorPositionsArray(descriptors: number[][][]): number[] {
    let nextDescriptorOffset = 0;
    let counter = 0;

    const retval: number[] = [];

    for (let i = 0; i < descriptors.length; i++) {
        const descriptor = descriptors[i];
        nextDescriptorOffset += descriptor.length;

        const isThereNextDescriptor = descriptors[i + 1] !== undefined;

        if (!isThereNextDescriptor) {
            continue;
        }

        const nextDescriptorStart = nextDescriptorOffset * 8;
        const nextDescriptorEnd = (nextDescriptorOffset + descriptors[i + 1].length) * 8 - 1;

        for (let j = 0; j < descriptor.length; j++) {
            retval.push((counter++) * 8);
            retval.push(nextDescriptorStart);
            retval.push(nextDescriptorEnd);
        }
    }

    return retval;
}

export class GpuMatcher {
    private gl: WebGL2RenderingContext;
    private matcherProgram: twgl.ProgramInfo;

    constructor() {
        this.gl = createGl()!;

        this.matcherProgram = twgl.createProgramInfo(this.gl, [
            matcherShader,
            stubShader,
        ], {
            transformFeedbackVaryings: ['hasNeighbor'],
        });

        this.gl.useProgram(this.matcherProgram.program);
        this.gl.enable(this.gl.RASTERIZER_DISCARD);
    }

    match(descriptors: number[][][]) {
        const gl = this.gl;

        const result: number[] = [];

        // Divide descriptors into chunks of 64 with overlap of 1
        const chunkSize = 24;
        const overlap = 1;

        const chunks: number[][][][] = [];

        for (let i = 0; i < descriptors.length; i += chunkSize - overlap) {
            const chunk = descriptors.slice(i, i + chunkSize);
            chunks.push(chunk);
        }

        for (let i = 0; i < chunks.length; i++) {
            const data = new Float32Array(flatten(chunks[i]));
            const {texture} = createDataTexture(gl, data, 1, gl.R32F, gl.RED, gl.FLOAT, gl.TEXTURE0);

            if (!texture) {
                throw new Error('Could not create texture');
            }

            const descriptorPositions = getDescriptorPositionsArray(chunks[i]);

            const pointsArray = new Int32Array(descriptorPositions);
            const RESULT_LENGTH = pointsArray.length / 3;

            const hasNeighborBuf = twgl.createBufferInfoFromArrays(this.gl, {
                hasNeighbor: {
                    numComponents: 1,
                    data: new Float32Array(RESULT_LENGTH),
                },
            });

            const va = twgl.createVertexArrayInfo(gl, this.matcherProgram,
                twgl.createBufferInfoFromArrays(gl, {
                    point: {
                        numComponents: 3,
                        data: pointsArray
                    }
                })
            );

            const transformFeedback = twgl.createTransformFeedback(gl, this.matcherProgram, hasNeighborBuf);

            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
            gl.beginTransformFeedback(gl.POINTS);

            twgl.setBuffersAndAttributes(gl, this.matcherProgram, va);

            gl.drawArrays(gl.POINTS, 0, RESULT_LENGTH);
            gl.endTransformFeedback();
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

            const results = new Int32Array(RESULT_LENGTH);

            gl.bindBuffer(gl.ARRAY_BUFFER, hasNeighborBuf.attribs!.hasNeighbor.buffer);
            gl.getBufferSubData(gl.ARRAY_BUFFER, 0, results);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            const arr = Array.from(results);
            let offset = 0;

            chunks[i].forEach((points, j) => {
                if (j === chunks[i].length - 1) {
                    return;
                }

                const neighborsCount = arr.slice(offset, offset + points.length).filter(a => a).length;
                result.push(neighborsCount);
                offset += points.length;
            });

            // Cleanup
            gl.deleteTexture(texture);
            gl.deleteBuffer(hasNeighborBuf.attribs!.hasNeighbor.buffer);
            gl.deleteVertexArray(va.vertexArrayObject!);
            gl.deleteTransformFeedback(transformFeedback);
        }

        return result;
    }
}
