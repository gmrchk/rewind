const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const baseConfig = {
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				options: {
					presets: ['es2015', 'stage-0'],
				}
			}
		]
	},
	optimization: {
		minimizer: [
			// we specify a custom UglifyJsPlugin here to get source maps in production
			new UglifyJsPlugin({
				uglifyOptions: {
					compress: false,
					ecma: 6,
					mangle: true
				},
				include: /\.min\.js$/
			})
		]
	}
};

const draggerConfig = Object.assign({}, baseConfig, {
	entry: {
		Dragger: './entry/Dragger.js',
		'Dragger.min': './entry/Dragger.js'
	},
	output: {
		path: __dirname + '/dist/',
		library: 'Dragger',
		libraryTarget: 'umd',
		filename: '[name].js'
	}
});

const rewindConfig = Object.assign({}, baseConfig, {
	entry: {
		Rewind: './entry/Rewind.js',
		'Rewind.min': './entry/Rewind.js'
	},
	output: {
		path: __dirname + '/dist/',
		library: 'Rewind',
		libraryTarget: 'umd',
		filename: '[name].js'
	}
});

const rewindGhPagesConfig = Object.assign({}, baseConfig, {
	entry: {
		Rewind: './entry/Rewind.js',
		'Rewind.min': './entry/Rewind.js'
	},
	output: {
		path: __dirname + '/docs/',
		library: 'Rewind',
		libraryTarget: 'umd',
		filename: '[name].js'
	}
});

module.exports = [draggerConfig, rewindConfig, rewindGhPagesConfig];
