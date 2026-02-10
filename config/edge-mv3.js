export default {
    js: {
        entry:{
            'lib': ['src/js/runtime.js', 'src/js/config.js', 'src/js/common.js', 'src/js/chrome.js'],
            '/': ['src/js/background.js'],
            'data/options': ['src/js/options.js'],
            'data/interface': ['src/js/index.js','src/js/service.js'],
        },
        filename: '[name]',
        target: 'es2020',
        minify: false,
        sourcemap: false
    },
    scss: {
        entry:{ 
            'data/options': ['src/scss/options.scss'],
            'data/interface': ['src/scss/style.scss']
        },
        filename: '[name]',
        minify: false,
        sourcemap: false
    },
    html: {
        entry:{
            'data/interface': ['src/html/index.html'],
            'data/options': ['src/html/options.html'],
        },
        filename: '[name]'
    },
    assets:{
        entry:{
           'data/icon': [
                'src/assets/icon',
                'src/assets/svg'
            ]
        }
    }
};


