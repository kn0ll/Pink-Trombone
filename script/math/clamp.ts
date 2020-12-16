export default function clamp(value: number, min: number, max: number) {
    return value <= min?
    min :
    value < max?
        value :
        max;
}