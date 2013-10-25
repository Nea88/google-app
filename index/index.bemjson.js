([
{
    block: 'i-global',
    params: {
        'page-url': ''
    }
},
{
    block: 'b-page',
    title: {
        block: 'i-bem',
        elem: 'i18n',
        keyset: 'b-page',
        key: 'page title'
    },
    js: true,
    favicon: '/favicon.ico',
    mods: { ajax: 'yes' },
    head: [
        { elem: 'meta', attrs: { name: 'description', content: 'Search for apps and games: The best site to find mobile apps and games relevant to your lifestyle. Mobile app search, Socially explore tablet apps/games, kindle fire apps, nook apps and more' }},
        { elem: 'css', url: '_index.css?v=' + Math.floor((Math.random()*100)+1), ie: false },
        { elem: 'css', url: '_index', ie: true },
        { elem: 'meta', attrs: { name: 'keywords', content: 'tablet apps, apps for kindle, iphone 4 apps, tablet games, find apps, iphone4 apps, kindle fire apps, apps for kindle fire, iphone 4s apps, free ipad apps, free galaxy games, app search, best ipad games, ipad 2 apps, iphone 5 apps, free ipad games, free galaxy games download, iphone 4 games, free galaxy apps, best tablet apps, search for apps, iphone4 games, iphone 3gs apps, top tablet apps, ipad 2 games, free tablet apps, iphone 4s games, kindle fire games, best ipad 2 apps, best nexus apps, best tablet games, nook apps, nook games' }},
        { tag: 'link', attrs: { rel: 'search', type: 'application/opensearchdescription+xml', title: 'www.appcurl.com', href: '/opensearch.xml' } }
    ],
    content: [
        {
            block: 'header'
        },
        {
            block: 'content',
            content: [
                {
                    block: 'appcurl-logo'
                },
                {
                    block: 'popup',
                    js: { id: 'why' },
                    mix: [ { block: 'popup', elem: 'switcher' }, { block: 'why', js: true }, { block: 'b-link' } ],
                    content: {
                        block: 'i-bem',
                        elem: 'i18n',
                        keyset: 'popup',
                        key: 'why appcurl'
                    }
                },
                {
                    block: 'appcurl-search',
                    content: [
                        {
                            block: 'b-form-input',
                            mix: [ { block: 'appcurl-search', elem: 'input' } ],
                            mods: { theme: 'grey', autocomplete: 'yes', 'has-clear': 'yes', size: 'xl' },
                            js: { dataprovider: { name: 'quick-search' }, showListOnFocus: false },
                            content: [
                                { elem: 'hint',
                                    content: {
                                        block: 'i-bem',
                                        elem: 'i18n',
                                        keyset: 'appcurl-search',
                                        key: 'search mobile apps'
                                    }
                                },
                                { elem: 'input', attrs: { name: 'suggest' }, clear: { elem: 'clear' } }
                            ]
                        },
                        {
                            block: 'b-form-button',
                            mix: [ { block: 'appcurl-search', elem: 'button' } ],
                            type: 'submit',
                            content: {
                                block: 'i-bem',
                                elem: 'i18n',
                                keyset: 'appcurl-search',
                                key: 'search'
                            }
                        }
                    ]
                },
                {
                    block: 'progress',
                    content: {
                        block: 'i-bem',
                        elem: 'i18n',
                        keyset: 'progress',
                        key: 'searching'
                    }
                },
                {
                    block: 'clearfix'
                },
                {
                    block: 'appcurl-lang-switcher'
                },
                {
                    block: 'appcurl-static-links'
                }
            ]
        },
        {
            block: 'serp',
            content: [
                { elem: 'statistics' },
                {
                    elem: 'layout-col',
                    mods: { position: 'left' },
                    content: {
                        block: 'serp-filter',
                        js: true,
                        content: [
                            {
                                elem: 'title',
                                content: {
                                    block: 'i-bem',
                                    elem: 'i18n',
                                    keyset: 'serp-filter',
                                    key: 'result filter'
                                }
                            },
                            // {
                            //     elem: 'caption',
                            //     content: {
                            //         block: 'i-bem',
                            //         elem: 'i18n',
                            //         keyset: 'serp-filter',
                            //         key: 'platforms'
                            //     }
                            // },
                            // {
                            //     elem: 'filter',
                            //     elemMods: { type: 'platform' }
                            // },
                            {
                                elem: 'caption',
                                content: 'Stores'
                            },
                            {
                                elem: 'filter',
                                elemMods: { type: 'stores' }
                            },
                            {
                                elem: 'caption',
                                content: {
                                    block: 'i-bem',
                                    elem: 'i18n',
                                    keyset: 'serp-filter',
                                    key: 'cost'
                                }
                            },
                            {
                                elem: 'filter',
                                elemMods: { type: 'price' }
                            },

                            {
                                elem: 'caption',
                                content: 'Games'
                            },
                            {
                                elem: 'filter',
                                elemMods: { type: 'games-categories' }
                            },

                            {
                                elem: 'caption',
                                content: 'Apps'
                            },
                            {
                                elem: 'filter',
                                elemMods: { type: 'categories' }
                            },
                            {
                                elem: 'caption',
                                content: {
                                    block: 'i-bem',
                                    elem: 'i18n',
                                    keyset: 'serp-filter',
                                    key: 'rating'
                                }
                            },
                            {
                                elem: 'filter',
                                elemMods: { type: 'rating' }
                            }
                        ]
                    }
                },
                {
                    elem: 'layout-col',
                    mods: { position: 'center' },
                    content: [
                        {
                            elem: 'apps'
                        },
                        { block: 'paginator' }
                    ]
                },
                {
                    elem: 'layout-col',
                    mods: { position: 'right' },
                    content: [
                        {
                            block: 'right-coll',
                            content: [
                                {
                                    block: 'serp-hint',
                                    js: true,
                                    content: [
                                        {
                                            block: 'right-coll',
                                            elem: 'title',
                                            content: {
                                                block: 'i-bem',
                                                elem: 'i18n',
                                                keyset: 'serp-hint',
                                                key: 'hint'
                                            }
                                        },
                                        {
                                            elem: 'content'
                                        }
                                    ]
                                },
                                {
                                    block: 'serp-sort',
                                    js: true,
                                    content: [
                                        {
                                            block: 'right-coll',
                                            elem: 'title',
                                            content: {
                                                block: 'i-bem',
                                                elem: 'i18n',
                                                keyset: 'serp-sort',
                                                key: 'sort by'
                                            }
                                        },
                                        {
                                            elem: 'content'
                                        }
                                    ]
                                },
                                {
                                    block: 'explore-view',
                                    js: true,
                                    content: [
                                        {
                                            block: 'right-coll',
                                            elem: 'title',
                                            content: {
                                                block: 'i-bem',
                                                elem: 'i18n',
                                                keyset: 'explore-view',
                                                key: 'explore view'
                                            }
                                        },
                                        {
                                            elem: 'content'
                                        }
                                    ]
                                },
                                {
                                    block: 'tags',
                                    js: true,
                                    content: [
                                        {
                                            block: 'right-coll',
                                            elem: 'title',
                                            content: {
                                                block: 'i-bem',
                                                elem: 'i18n',
                                                keyset: 'tags',
                                                key: 'result bins'
                                            }
                                        },
                                        {
                                            elem: 'content'
                                        }
                                    ]
                                }
                                // ,
                                // {
                                //     block: 'ads',
                                //     content: [
                                //         'Airomo ads',
                                //         'When you have your mobile & apps 24/7, how can anyone else be an expert but you? Sign in now!'
                                //     ]
                                // }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            block: 'store-badges',
            content: [
                {
                    block: 'bigredsquare',
                    content: {
                        block: 'b-link',
                        url: '/mobile/',
                        content: {
                            block: 'i-bem',
                            elem: 'i18n',
                            keyset: 'store-badges',
                            key: 'it all starts here'
                        }
                    }
                },
                {
                    block: 'b-link',
                    target: '_blank',
                    url: 'https://itunes.apple.com/us/app/appcurl-discover-awesome-apps/id675667680',
                    mix: [ { block: 'store-badge', mods: { store: 'itunes', theme: 'light' } } ]
                },
                {
                    block: 'b-link',
                    target: '_blank',
                    url: 'https://play.google.com/store/apps/details?id=com.airomo.appcurl',
                    mix: [ { block: 'store-badge', mods: { store: 'google-play', theme: 'light' } } ]
                },
                {
                    block: 'b-link',
                    target: '_blank',
                    url: 'http://www.amazon.com/Airupt-Inc-AppCurl/dp/B008RBMML4/',
                    mix: [ { block: 'store-badge', mods: { store: 'amazon', theme: 'light' } } ]
                }
            ]
        },
        {
            block: 'appcurl-footer'
        },
        {
            block: 'popup',
            js: { id: 'why' },
            mix: [ { block: 'popup', elem: 'popup' } ],
            content: [
                {
                    elem: 'close',
                    content: '×'
                },
                {
                    block: 'appcurl-logo'
                },
                {
                    tag: 'p',
                    content: {
                        block: 'i-bem',
                        elem: 'i18n',
                        keyset: 'popup',
                        key: 'what is appcurl text'
                    }
                },
                {
                    tag: 'p',
                    content: {
                        block: 'i-bem',
                        elem: 'i18n',
                        keyset: 'popup',
                        key: 'appcurl unibased text'
                    }
                },
                {
                    tag: 'p',
                    content: {
                        block: 'i-bem',
                        elem: 'i18n',
                        keyset: 'popup',
                        key: 'example usage'
                    }
                },
                {
                    block: 'promo-video',
                    tag: 'iframe',
                    attrs: {
                        width: '560',
                        height: '315',
                        //src: 'http://www.youtube.com/embed/iWPJfHPOq0w?rel=0',
                        frameborder: '0',
                        allowfullscreen: 'allowfullscreen'
                    }
                }
            ]
        },
        { block: 'i-jquery', mods: { version: '1.8.3' } },
        { block: 'api-airomo-js' },
        { block: 'airomo-api-v2' },
        { elem: 'js', elemMods: { i18n: 'yes' }, url: '_index.js?v=' + Math.floor((Math.random()*100)+1) }
    ]
}
])
