#version 300 es
precision highp float;

flat out int hasNeighbor;
uniform sampler2D descriptorsTex;
in vec3 point;

float getAs1D(sampler2D tex, ivec2 dimensions, int index) {
    int y = index / dimensions.x;
    int x = index % dimensions.x;
    return texelFetch(tex, ivec2(x, y), 0).x;
}

int hammingDistance(int a, int b) {
    int val = a ^ b;

    val = (val & 0x55555555) + ((val >> 1) & 0x55555555);
    val = (val & 0x33333333) + ((val >> 2) & 0x33333333);
    val = (val & 0x0F0F0F0F) + ((val >> 4) & 0x0F0F0F0F);
    val = (val & 0x0000FFFF) + ((val >> 16) & 0x0000FFFF);

    return (val & 0x000000FF) + ((val >> 8) & 0x000000FF);
}

void main() {
    ivec2 texDimensions = textureSize(descriptorsTex, 0);

    int dist1 = 2147483647;
    int dist2 = dist1;

    bool foundNeighbor = false;

    /*
        Looping over the descriptors of the frame to compare with.
        point[1] and point[2] are the start and end index of the frame to compare with.
    */
    for (int i = int(point[1]); i <= int(point[2]); i += 8) {
        int d = 0;

        for (int j = 0; j < 8; j++) {
            d += hammingDistance(
                int(getAs1D(descriptorsTex, texDimensions, i + j)),
                int(getAs1D(descriptorsTex, texDimensions, int(point[0]) + j)) // point[0] is the index of the current frame descriptor
            );
        }

        if (d < dist1) {
            dist2 = dist1;
            dist1 = d;
            foundNeighbor = true;
        } else if (d < dist2) {
            dist2 = d;
        }

        // foundNeighbor = (d < dist1) || foundNeighbor;
        // dist2 = max(min(d, dist2), dist1);
        // dist1 = min(d, dist1);
    }

    hasNeighbor = int(foundNeighbor && float(dist1) < 0.3 * float(dist2));
}
