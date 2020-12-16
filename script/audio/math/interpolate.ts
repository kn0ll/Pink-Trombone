import clamp from "./clamp";

export default function interpolate(interpolation: number, from: number, to: number) {
    interpolation = clamp(interpolation, 0, 1);
    return (from * (1 - interpolation)) + (to * (interpolation));
}