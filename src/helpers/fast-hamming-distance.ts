export function hammingDistance(a: number, b: number) {
    let val = a ^ b;

    val = (val & 0x55555555) + ((val >> 1) & 0x55555555);
    val = (val & 0x33333333) + ((val >> 2) & 0x33333333);
    val = (val & 0x0F0F0F0F) + ((val >> 4) & 0x0F0F0F0F);
    val = (val & 0x0000FFFF) + ((val >> 16) & 0x0000FFFF);

    return val;
}
