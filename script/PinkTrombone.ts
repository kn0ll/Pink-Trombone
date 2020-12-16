/*
    TODO
        start/stop for the pinkTromboneNode
*/

// @ts-nocheck
import createNoise from "./audio/nodes/noise/AudioNode";
import PinkTromboneNode from "./audio/nodes/pinkTrombone/AudioNode";

type Constriction = any;

class PinkTrombone {
    private audioContext: AudioContext;
    public loadPromise: Promise<AudioContext>;
    private _noise?: AudioBufferSourceNode;
    private _aspirateFilter?: BiquadFilterNode;
    private _fricativeFilter?: BiquadFilterNode;
    private _pinkTromboneNode?: PinkTromboneNode;
    private _gain?: GainNode;

    private addModules(audioContext: AudioContext, workletPath: string) {
        if(audioContext.audioWorklet !== undefined) {
            //return audioContext.audioWorklet.addModule("./script/audio/nodes/pinkTrombone/processors/WorkletProcessor.js")
            return audioContext.audioWorklet.addModule(workletPath);
        }
        else {
            return new Promise<void>((resolve, reject) => {
                resolve();
            });
        }
    }

    constructor(audioContext: AudioContext, workletPath: string) {
        this.audioContext = audioContext;
        this.loadPromise = 
            this.addModules(audioContext, workletPath)
                .then(() => {
                    this.audioContext = audioContext;
                    this.setupAudioGraph();
                    return this.audioContext;
                });
    }

    private setupAudioGraph() {
        this._noise = createNoise(this.audioContext);

        this._aspirateFilter = this.audioContext.createBiquadFilter();
                this._aspirateFilter.type = "bandpass";
                this._aspirateFilter.frequency.value = 500;
                this._aspirateFilter.Q.value = 0.5;
            
        this._fricativeFilter = this.audioContext.createBiquadFilter();
            this._fricativeFilter.type = "bandpass";
            this._fricativeFilter.frequency.value = 1000;
            this._fricativeFilter.Q.value = 0.5;

        this._pinkTromboneNode = new PinkTromboneNode(this.audioContext);

        this._noise.connect(this._aspirateFilter);
            this._aspirateFilter.connect(this._pinkTromboneNode.noise);

        this._noise.connect(this._fricativeFilter);
            this._fricativeFilter.connect(this._pinkTromboneNode.noise);

        this._gain = this.audioContext.createGain();
            this._gain.gain.value = 0;
            this._pinkTromboneNode.connect(this._gain);
    }

    get parameters() {
        return this._pinkTromboneNode._parameters;
    }

    public connect() {
        return this._gain!.connect(...arguments);
    }
    public disconnect() {
        return this._gain!.disconnect(...arguments);
    }

    public start() {
        this._gain!.gain.value = 1;
    }
    public stop() {
        this._gain!.gain.value = 0;
    }

    get constrictions() {
        return this._pinkTromboneNode!.constrictions;
    }
    public newConstriction() {
        return this._pinkTromboneNode!.newConstriction(...arguments);
    }
    public removeConstriction(constriction: Constriction) {
        this._pinkTromboneNode!.removeConstriction(constriction);
    }

    public getProcessor() {
        return this._pinkTromboneNode!.getProcessor();
    }
}

export default PinkTrombone;