export default {
    js: {
        entry:{
            'lib': [ 
                'platform/opera/platform.js', 
                'src/js/browser.js', 
                'src/js/runtime.js', 
                'src/js/config.js', 
                'src/js/common.js'
            ],
            '/': ['src/js/background.js'],
            'data/options': ['src/js/options.js'],
            'data/interface': ['src/js/index.js','src/js/anime.js'],
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
           'data/icons': [
                'src/assets/icon',
                'src/assets/svg'
            ]
        }
    },
    "locales": [
        "en", 
        "es", 
        "fa", 
        "fi", 
        "fr", 
        "it", 
        "ja",
        "ko",
        "ru",
        "sv",
        "sw",
        "zh-CN",
        "zh-TW"
    ]
};


