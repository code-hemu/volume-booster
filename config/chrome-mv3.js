export default {
    "esbuild": {
        entry: {
            'data/interface': ['src/ts/index.ts','src/ts/service.ts'],
            'data/options': ['src/ts/options.ts'],
            '/': ['src/background.js'],
            'lib': ['src/lib/runtime.js', 'src/lib/config.js', 'src/lib/common.js', 'src/lib/chrome.js']
        },
        filename: '[name].js',

        target: 'es2020',
        minify: false,
        sourcemap: false,

        define: {
            __DEV__: 'false'
        }
    },
    "less":{
        entry: {
            'src/less/style.less': 'data/interface/style.css',
            'src/less/options.less': 'data/options/options.css'
        },
        compress: true,
    }

};