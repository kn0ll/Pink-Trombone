/*
    TODO
        *
*/

import clamp from "../../../../math/clamp";
import SimplexNoise from "./SimplexNoise";

class Glottis {
    private noise: SimplexNoise;
    private coefficients: {
      alpha: number;
      Delta: number;
      E0: number;
      epsilon: number;
      omega: number;
      shift: number;
      Te: number;
    };
    private startSeconds: number;

    constructor() {
        this.noise = new SimplexNoise();

        this.coefficients = {
            alpha : 0,
            Delta : 0,
            E0 : 0,
            epsilon : 0,
            omega : 0,
            shift : 0,
            Te : 0,
        };

        this.startSeconds = 0;
    }

    public process(parameterSamples: any, sampleIndex: number, bufferLength: number, seconds: number ) {

        const intensity = parameterSamples.intensity;
        const loudness = parameterSamples.loudness;

        var vibrato = 0;
        vibrato += parameterSamples.vibratoGain * Math.sin(2 * Math.PI * seconds * parameterSamples.vibratoFrequency);
        vibrato += 0.02 * this.noise.simplex1(seconds * 4.07);
        vibrato += 0.04 * this.noise.simplex1(seconds * 2.15);

        if(parameterSamples.vibratoWobble > 0) {
            var wobble = 0;
                wobble += 0.2 * this.noise.simplex1(seconds * 0.98);
                wobble += 0.4 * this.noise.simplex1(seconds * 0.50);
            vibrato += wobble * parameterSamples.vibratoWobble;
        }

        var frequency = parameterSamples.frequency;
        frequency *= (1 + vibrato);

        var tenseness = parameterSamples.tenseness;
        tenseness += 0.10 * this.noise.simplex1(seconds * 0.46);
        tenseness += 0.05 * this.noise.simplex1(seconds * 0.36);
        tenseness += (3 - tenseness) * (1 - intensity);


        // waveform.update()
        const period = (1/frequency);

        var secondsOffset = (seconds - this.startSeconds);
        var interpolation = secondsOffset/period;

        if(interpolation >= 1) {
            this.startSeconds = seconds + (secondsOffset % period);
            interpolation = this.startSeconds/period;
            this._updateCoefficients(tenseness);
        }


        // process
        var outputSample = 0;
        
        var noiseModulator = this._getNoiseModulator(interpolation);
            noiseModulator += ((1 -(tenseness*intensity)) *3);
        parameterSamples.noiseModulator = noiseModulator;

        var noise = parameterSamples.noise;
            noise *= noiseModulator;
            noise *= intensity;
            noise *= intensity;
            noise *= (1 - Math.sqrt(Math.max(tenseness, 0)));
            noise *= (0.02*this.noise.simplex1(seconds*1.99)) + 0.2;

        var voice = this._getNormalizedWaveform(interpolation);
            voice *= intensity;
            voice *= loudness;

        outputSample = noise + voice;
        outputSample *= intensity;

        return outputSample;
    }

    public update() {
        
    }

    private _updateCoefficients(tenseness = 0) {

        const d = clamp(3*(1-tenseness), 0.5, 2.7);
        const a = -0.01 + 0.048*d;
        const k = 0.224 + 0.118*d;
        const g = (k/4)*(0.5+1.2*k)/(0.11*d-a*(0.5+1.2*k));

        const p = 1/(2*g);
        const e = p + p*k;

        this.coefficients.epsilon = 1/a;
        this.coefficients.shift = Math.exp(-this.coefficients.epsilon * (1-e));
        this.coefficients.Delta = 1 - this.coefficients.shift;

        const RHS = ((1/this.coefficients.epsilon) * (this.coefficients.shift-1) + (1-e) * this.coefficients.shift) / this.coefficients.Delta;
        const lower = -(e - p)/2 + RHS;
        const upper = -lower;

        this.coefficients.omega = Math.PI/p;
        
        const s = Math.sin(this.coefficients.omega * e);
        const y = -Math.PI * s * upper / (p*2);
        const z = Math.log(y);

        this.coefficients.alpha = z/(p/2 - e);
        this.coefficients.E0 = -1 / (s*Math.exp(this.coefficients.alpha*e));
        this.coefficients.Te = e;
    }

    private _getNormalizedWaveform(interpolation: number) {
        return (interpolation > this.coefficients.Te)?
            (-Math.exp(-this.coefficients.epsilon * (interpolation-this.coefficients.Te)) + this.coefficients.shift)/this.coefficients.Delta :
            this.coefficients.E0 * Math.exp(this.coefficients.alpha*interpolation) * Math.sin(this.coefficients.omega * interpolation);
    }

    private _getNoiseModulator(interpolation: number) {
        const angle = 2*Math.PI*interpolation;
        const amplitude = Math.sin(angle);
        const positiveAmplitude = Math.max(0, amplitude);
        
        const offset = 0.1
        const gain = 0.2;

        const noiseModulator = ((positiveAmplitude *gain) + offset);

        return noiseModulator;
    }
}

export default Glottis;