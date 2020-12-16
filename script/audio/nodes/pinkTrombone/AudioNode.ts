/*
    TODO
        *
*/

// @ts-nocheck
import { numberOfConstrictions } from "./processors/ParameterDescriptors";

type Constriction = any;

// CONSTRUCTOR HELPERS
function setupNode(audioNode) {
    audioNode._constrictions = [];
    for(let constrictionIndex = 0; constrictionIndex < numberOfConstrictions; constrictionIndex++) {
        audioNode._constrictions[constrictionIndex] = {
            _index : constrictionIndex,

            index : null,
            diameter : null,

            _enable : () => audioNode._enableConstriction(constrictionIndex),
            _disable : () => audioNode._disableConstriction(constrictionIndex),

            _isEnabled : false,
        };
    }

    audioNode.newConstriction = function(index: number, diameter: number) {
        return this._constrictions.find(constriction => {
            if(!constriction._isEnabled) {
                if(index !== undefined)
                    constriction.index.value = index;

                if(diameter !== undefined)
                    constriction.diameter.value = diameter;

                constriction._enable();
                return true;
            }
        });
    }

    audioNode.removeConstriction = function(constriction: Constriction) {
        constriction._disable();
    }

    Object.defineProperty(audioNode, "constrictions", {
        get : function() {
            return this._constrictions.filter(constriction => constriction._isEnabled)
        }
    });

    audioNode._parameters = {};

    audioNode.tongue = audioNode._parameters.tongue = {
        index : null,
        diameter : null,
    };
    audioNode.vibrato = audioNode._parameters.vibrato = {
        frequency : null,
        gain : null,
        wobble : null,
    };
}
function assignAudioParam(audioNode, audioParam, paramName) {
    if(paramName.includes("constriction")) {
        const constrictionIndex = Number(paramName.match(/[0-9]+/g)[0]);
        const constriction = audioNode._constrictions[constrictionIndex];

        constriction[paramName.includes("index")? "index":"diameter"] = audioParam;
        
        audioNode.constrictions[constrictionIndex] = constriction;
    }
    else if(paramName.includes("vibrato")) {
        audioNode.vibrato[paramName.replace("vibrato", '').toLowerCase()] = audioParam;
    }
    else if(paramName.includes("tongue")) {
        audioNode.tongue[paramName.replace("tongue", '').toLowerCase()] = audioParam;
    }
    else {
        audioNode[paramName] = audioNode._parameters[paramName] = audioParam;    
    }
}

class PinkTromboneNode extends AudioWorkletNode {
    constructor(audioContext: AudioContext) {
        // @ts-ignore
        super(audioContext, "pink-trombone-worklet-processor");

        setupNode(this);

        this.parameters.forEach((audioParam, paramName) => {
            assignAudioParam(this, audioParam, paramName);
        });

        this.port.onmessage = (event) => {
            switch(event.data.name) {
                default:
                    break;
            }
        }
    }

    _postMessage(eventData: UnknownEvent) {
        eventData.id = Math.random();

        return new Promise((resolve, reject) => {
            const resolveCallback = (event) => {
                if(eventData.id == Number(event.data.id)) {
                    this.port.removeEventListener("message", resolveCallback);
                    resolve(event);
                }
            }

            this.port.addEventListener("message", resolveCallback);
            this.port.postMessage(eventData);
        });
    }

    _enableConstriction(constrictionIndex) {
        return this._postMessage({
            name : "enableConstriction",
            constrictionIndex : constrictionIndex,
        }).then(() => {
            this._constrictions[constrictionIndex]._isEnabled = true;
        });
    }

    _disableConstriction(constrictionIndex) {
        return this._postMessage({
            name : "disableConstriction",
            constrictionIndex : constrictionIndex,
        }).then(() => {
            this._constrictions[constrictionIndex]._isEnabled = false; 
        });
    }

    getProcessor() {
        return this._postMessage({
            name : "getProcessor",
        }).then(event => {
            return JSON.parse(event.data.processor);
        });
    }
}

export default PinkTromboneNode;
