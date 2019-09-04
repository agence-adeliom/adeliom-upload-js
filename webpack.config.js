const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: "production",
    entry: "./src/upload",
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
                    path.resolve(__dirname, "src")
                ],
                exclude: [
                    path.resolve(__dirname, "demo")
                ],
                loader: "babel-loader",
                options: {
                    presets: ["@babel/preset-env"]
                },
            }
        ]
    }
};