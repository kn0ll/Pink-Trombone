/*
    TODO            
        add "precision" property to iterate this.tract.process
*/

import Glottis from "./Glottis";
// @ts-ignore
import Tract from "./Tract";

type Constriction = any;

class Processor {
    private glottis: Glottis;
    private tract: Tract;

    constructor() {
        this.glottis = new Glottis();
        this.tract = new Tract();
    }

    process(parameterSamples: any, sampleIndex: number, bufferLength: number, seconds: number) {
        var outputSample = 0;
        
        // @ts-ignore
        const glottisSample = this.glottis.process(...arguments);
        parameterSamples.glottis = glottisSample;

        // @ts-ignore
        outputSample += this.tract.process(...arguments);
            sampleIndex += 0.5; // process twice - note the "...arguments" doesn't read this
        outputSample += this.tract.process(parameterSamples, sampleIndex, bufferLength, seconds);

        outputSample *= 0.125;

        return outputSample;
    }

    update(seconds: number, constrictions: Constriction[]) {
        this.glottis.update();
        this.tract.update(seconds, constrictions);
    }
}

export default Processor;