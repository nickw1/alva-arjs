const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
		'aframe':  path.resolve(__dirname, 'src/alva-aframe.js'),
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
