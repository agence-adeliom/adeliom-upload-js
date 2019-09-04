const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: "production",
    entry: ["core-js/stable", "regenerator-runtime/runtime", "./src/upload"],
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "upload.js",
        library: "Upload JS",
        libraryTarget: "umd",
    },
    optimization: {
        minimizer: [new TerserPlugin()],
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [
                ],
                exclude: [
                ],
                loader: "babel-loader",
                options: {
                    presets: ["es2015"]
                },
            }
        ]
    }
};