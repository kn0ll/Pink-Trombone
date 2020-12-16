/*
    TODO
        .type property that allows for different noise types (white noise, pink noise, etc)
*/

const createNoise = function(audioContext: AudioContext) {
    const noiseNode = audioContext.createBufferSource();

    const seconds = 1;

    const buffer = audioContext.createBuffer(1, seconds*audioContext.sampleRate, audioContext.sampleRate);
    const bufferChannel = buffer.getChannelData(0);
    for(let sampleIndex = 0; sampleIndex < bufferChannel.length; sampleIndex++)
        bufferChannel[sampleIndex] = ((Math.random() *2) -1);

    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    noiseNode.start();
    
    return noiseNode;
}

export default createNoise;

