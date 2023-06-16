const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        'three':  path.resolve(__dirname, 'three/index.js'),
        'aframe':  path.resolve(__dirname, 'aframe/alva-arjs.js'),
    },
    output: {
        path: path.resolve(__dirname, 'public/dist'),
        filename: '[name]/bundle.js'
    },
    optimization: {
        minimize: false
    },
    plugins: [
        new NodePolyfillPlugin()
    ]
};
