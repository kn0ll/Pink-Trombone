const path = require('path');

const whichFile = process.env.APP || "component";

module.exports = {
    entry: {
        app : {
            "component" : './script/component.ts',
            "pink-trombone" : './script/audio/nodes/pinkTrombone/processors/WorkletProcessor.ts',
        }[whichFile]
        
        // app: './script/component.js'
        // app: './script/audio/nodes/pinkTrombone/processors/WorkletProcessor.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename : {
            "component" : 'pink-trombone.min.js',
            "pink-trombone" : 'pink-trombone-worklet-processor.min.js',
        }[whichFile]

        // filename: 'pink-trombone.min.js'
        // filename: 'pink-trombone-worklet-processor.min.js'

    },
    module: {
        rules: [{
            test: /\.ts$/,
            loader: "ts-loader"
        }]
    },
    resolve: {
        extensions: [".ts"]
    }
}