/*
    TODO
        *
*/

import ParameterDescriptors, { numberOfConstrictions } from "./ParameterDescriptors";
import Processor from "./Processor";

// @ts-ignore
class PinkTromboneWorkletProcessor extends AudioWorkletProcessor {
    private processor: Processor;
    private enabledConstrictionIndices: any[];
    private port: any;

    constructor() {
        super();

        this.processor = new Processor();
        this.enabledConstrictionIndices = [];

        this.port.onmessage = (event: any) => {
            switch(event.data.name) {
                case "enableConstriction":
                    this.enabledConstrictionIndices[event.data.constrictionIndex] = true;
                    this.port.postMessage(event.data);
                    break;
                case "disableConstriction":
                    this.enabledConstrictionIndices[event.data.constrictionIndex] = false;
                    this.port.postMessage(event.data);
                    break;

                case "enabledConstrictionIndices":
                    event.data.enabledConstrictionIndices = this.enabledConstrictionIndices;
                    this.port.postMessage(event.data);
                    break;
                
                case "getProcessor":
                    event.data.processor = JSON.stringify(this.processor);
                    this.port.postMessage(event.data);
                    break;
                default:
                    break;
            }
        }
    }

    static get parameterDescriptors() {
        return ParameterDescriptors;
    }

    private _getParameterSamples(parameters: any, sampleIndex: number) {
        const parameterSamples: any = {};

        for(let parameterDescriptorIndex = 0; parameterDescriptorIndex < PinkTromboneWorkletProcessor.parameterDescriptors.length; parameterDescriptorIndex++) {
            const parameterDescriptor = PinkTromboneWorkletProcessor.parameterDescriptors[parameterDescriptorIndex];
            if(!parameterDescriptor.name.includes("constriction")) {
                parameterSamples[parameterDescriptor.name] = (parameters[parameterDescriptor.name].length == 1)?
                    parameters[parameterDescriptor.name][0] :
                    parameters[parameterDescriptor.name][sampleIndex];
            }
        }

        return parameterSamples;
    }

    private _getConstrictions(parameters: any) {
        const constrictions = [];

        for(let constrictionIndex = 0; constrictionIndex < numberOfConstrictions; constrictionIndex++) {
            if(this.enabledConstrictionIndices[constrictionIndex]) {
                const prefix = "constriction" + constrictionIndex;

                const constriction = {
                    index : parameters[prefix + "index"][0],
                    diameter : parameters[prefix + "diameter"][0],
                };

                constrictions[constrictionIndex] = constriction;
            }
        }

        return constrictions;
    }

    public process(inputs: any, outputs: any, parameters: any) {
        const constrictions = this._getConstrictions(parameters);

        for(let outputIndex = 0; outputIndex < outputs.length; outputIndex++) {
            for(let channelIndex = 0; channelIndex < outputs[outputIndex].length; channelIndex++) {
                for(let sampleIndex = 0; sampleIndex < outputs[outputIndex][channelIndex].length; sampleIndex++) {                    
                    const parameterSamples = this._getParameterSamples(parameters, sampleIndex);
                    // @ts-ignore
                    const seconds = currentTime + (sampleIndex/sampleRate);
                    const outputSample = this.processor.process(parameterSamples, sampleIndex, outputs[outputIndex][channelIndex].length, seconds);

                    outputs[outputIndex][channelIndex][sampleIndex] = outputSample;
                }
            }
        }
                
        // @ts-ignore
        this.processor.update(currentTime + (outputs[0][0].length/sampleRate), constrictions);

        return true;
    }
}

// @ts-ignore
registerProcessor("pink-trombone-worklet-processor", PinkTromboneWorkletProcessor);