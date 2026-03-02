export default {
    js: {
        entry:{
            'lib': [ 
                'platform/edge/platform.js', 
                'src/js/browser.js', 
                'src/js/runtime.js', 
                'src/js/config.js', 
                'src/js/common.js'
            ],
            '/': ['src/js/background.js'],
            'data/offscreen': ['src/js/offscreen.js'],
            'data/interface': ['src/js/index.js','src/js/anime.js'],
        },
        
        filename: '[name]',
        target: 'es2020',
        minify: false,
        sourcemap: false
    },
    scss: {
        entry:{ 
            'data/interface': ['src/scss/style.scss']
        },
        filename: '[name]',
        minify: false,
        sourcemap: false
    },
    html: {
        entry:{
            'data/interface': ['src/html/index.html'],
            'data/offscreen': ['src/html/offscreen.html'],
        },
        filename: '[name]'
    },
    assets:{
        entry:{
           'data/icons': [
                'src/assets/icon',
                'src/assets/svg'
            ]
        }
    }
};


