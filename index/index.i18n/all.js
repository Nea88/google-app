({
    "all": {
        "": "\n/* global BEM, i18n */\n(function(global_, bem_, undefined) {\n\n// Check if BEM.I18N was already initialized\nif(typeof bem_.I18N === 'function' && bem_.I18N._proto) {\n    return bem_.I18N;\n}\n\n/**\n * Support tanker-like syntax of keys in `i-bem__i18n`\n * @example\n *  i18n['prj']['keyset']['key'](params)\n */\nif(typeof i18n === 'undefined') {\n    /* jshint -W020 */\n    i18n = {};\n    /* jshint +W020 */\n}\n\n/* jshint -W020 */\nBEM = bem_;\n/* jshint +W020 */\n\nvar MOD_DELIM = '_',\n    ELEM_DELIM = '__',\n    DEFAULT_LANG = 'ru',\n    cache = {},\n    // {String[]} A stack used for restoring context of dynamic keysets\n    stack = [],\n    debug = false,\n    // @see http://whattheheadsaid.com/2011/04/internet-explorer-9s-problematic-console-object\n    hasConsole = typeof console !== 'undefined' && typeof console.log === 'function';\n\nfunction log() {\n    if(debug && hasConsole) {\n        console.log.apply(console, arguments);\n    }\n}\n\nfunction bemName(decl) {\n    typeof decl === 'string' && (decl = { block: decl });\n\n    return decl.block +\n        (decl.elem ? (ELEM_DELIM + decl.elem) : '') +\n        (decl.modName ? MOD_DELIM + decl.modName + MOD_DELIM + decl.modVal : '');\n}\n\nfunction bemParse(name) {\n    var bemitem = {};\n\n    name.split(ELEM_DELIM).forEach(function(item, i) {\n        var keys = [ i ? 'elem' : 'block', 'mod', 'val' ];\n\n        item.split(MOD_DELIM).forEach(function(part, j) {\n            bemitem[keys[j]] = part;\n        });\n    });\n\n    return bemitem;\n}\n\nfunction _pushStack(name) {\n    if(!name) return false;\n    return stack.push(name);\n}\n\nfunction _popStack() {\n    return stack.length && stack.pop();\n}\n\n\n/**\n * @constructor\n */\nfunction _i18n() {\n    this._lang = '';\n    this._prj = 'lego'; // FIXME: bem-bl?\n    this._keyset = '';\n    this._key = '';\n}\n\n_i18n.prototype = {\n\n    lang : function(name) {\n        this._lang = name;\n        return this;\n    },\n\n    project : function(name) {\n        this._prj = name;\n        return this;\n    },\n\n    keyset : function(name, saveCtx) {\n        saveCtx && _pushStack(this._keyset);\n\n        this._keyset = bemName(name);\n        return this;\n    },\n\n    key : function(name) {\n        this._key = name;\n        return this;\n    },\n\n    /**\n     * FIXME: Move legacy-syntax support into separat method\n     * @param {Object|Function} v\n     */\n    decl : function(v) {\n        var bemitem = bemParse(this._keyset),\n            // tanker legacy syntax\n            prj = bemitem.block === 'i-tanker' ? 'tanker' : this._prj,\n            keyset = bemitem.elem || this._keyset,\n            key = this._key;\n\n        prj = i18n[prj] || (i18n[prj] = {});\n        keyset = prj[keyset] || (prj[keyset] = {});\n        keyset[key] = typeof v === 'function' ? v : (function(p) { return (v); });\n\n        // `BEM.I18N` syntax\n        var l = cache[this._lang] || (cache[this._lang] = {}),\n            k = l[this._keyset] || (l[this._keyset] = {});\n\n        k[key] = v;\n    },\n\n    val : function(params, ctx) {\n        var value = cache[this._lang] && cache[this._lang][this._keyset],\n            debugString = 'keyset: ' + this._keyset + ' key: ' + this._key + ' (lang: ' + this._lang + ')';\n\n        if(!value) {\n            log('[I18N_NO_KEYSET] %s', debugString);\n            return '';\n        }\n\n        value = value[this._key];\n\n        var valtype = typeof value;\n        if(valtype === 'undefined') {\n            log(\"[I18N_NO_VALUE] %s\", debugString);\n            return '';\n        }\n\n        if(valtype === 'string') {\n            return value;\n        }\n\n        ctx || (ctx = this);\n        // TODO: try/catch\n        return value.call(ctx, params);\n    },\n\n    _cache : function() { return cache; }\n\n};\n\n/**\n * @namespace\n * @lends BEM.I18N\n */\nbem_.I18N = (function(base) {\n\n    /**\n     * Shortcut to get key value\n     *\n     * @param {String|Object} keyset\n     * @param {String} key\n     * @param {Object} [params]\n     * @returns {String}\n     */\n    var klass = function(keyset, key, params) {\n        return klass.keyset(keyset).key(key, params);\n    };\n\n    klass._proto = base;\n\n    /**\n     * @param {String} name\n     * @returns {BEM.I18N}\n     */\n    klass.project = function(name) {\n        this._proto.project(name);\n        return this;\n    };\n\n    /**\n     * @param {String} name\n     * @returns {BEM.I18N}\n     */\n    klass.keyset = function(name) {\n        this._proto.keyset(name, true);\n        return this;\n    };\n\n    /**\n     * @param {String} name Key name\n     * @param {Object} params\n     * @returns {String}\n     */\n    klass.key = function(name, params) {\n        var proto = this._proto,\n            result,\n            ksetRestored;\n\n        proto.lang(this._lang).key(name);\n\n        // TODO: kiss\n        result = proto.val.call(proto, params, klass);\n\n        // restoring keyset's context\n        // NOTE: should not save current ctx, `saveCtx = false`\n        ksetRestored = _popStack();\n        ksetRestored && proto.keyset(ksetRestored, false);\n\n        return result;\n    };\n\n    /**\n     * Declaration of translations\n     *\n     * @param {String|Object} bemitem\n     * @param {Object} keysets\n     * @param {Object} [params] declaration params\n     * @returns {BEM.I18N}\n     */\n    klass.decl = function(bemitem, keysets, params) {\n        var proto = this._proto,\n            k;\n\n        params || (params = {});\n        params.lang && proto.lang(params.lang);\n\n        proto.keyset(bemitem);\n\n        for(k in keysets) {\n            if(keysets.hasOwnProperty(k)) {\n                proto.key(k).decl(keysets[k]);\n            }\n        }\n\n        return this;\n    };\n\n    /**\n     * Get/set current language\n     *\n     * @param {String} [lang]\n     * @returns {String}\n     */\n    klass.lang = function(lang) {\n        typeof lang !== 'undefined' && (this._lang = lang);\n        return this._lang;\n    };\n\n    klass.debug = function(flag) {\n        debug = !!flag;\n    };\n\n    klass.lang(DEFAULT_LANG);\n\n    return klass;\n\n}(new _i18n()));\n\n})(this, typeof BEM === 'undefined' ? {} : BEM);\n\n"
    },
    "en": {
        "b-page": {
            "page title": "Search for apps with Appcurl: tablet apps, kindle fire apps, nook apps and more",
            "username": "Join/Login",
            "login": "Login",
            "my profile": "My Profile",
            "settings": "Settings",
            "log out": "Log out"
        },
        "popup": {
            "why appcurl": "Why Appcurl?",
            "what is appcurl text": "The Appcurl app discovery solution allow users to search, explore and find the best tablet apps, android/iphone apps and kindle fire apps. Appcurl seamlessly combines user's mobile, online and social habits to determine and deliver the most accurate and relevant search results. Appcurl provides three interfaces to discover apps; a powerful mobile app search engine, engaging Explore Interface and a social navigation interface, to allow users to discover the most relevant tablet/phone/ipad apps or games.",
            "appcurl unibased text": "Appcurl is totally unbiased. Appcurl does not promote or sell any apps. Appcurl believes the true experts of mobile applications are the user’s themselves, it encourages users to get loud with their app experience and influence the world around them.",
            "example usage": "Example Usage: With appcurl, users can search for apps specifically for a platform; for instance only kindle fire apps or google play apps or ipad apps. The search results can be filtered by various controls including, cost (eg : free kindle fire apps), tags (eg : kids education, stock trading etc.) or by any random keywords (eg: iphone 3gs apps, free galaxy games download or ipad 2 games etc.)."
        },
        "appcurl-search": {
            "search mobile apps": "Search for apps, games...",
            "search": "Search"
        },
        "progress": {
            "searching": "Searching..."
        },
        "option": {
            "en": "English",
            "ru": "Русский",
            "uk": "Українська",
            "zh": "中文",
            "pt": "Português",
            "jp": "日本語",
            "kr": "한국어",
            "es": "Español"
        },
        "appcurl-static-links": {
            "explore": "Explore",
            "apps": "apps",
            "games": "games",
            "users": "users"
        },
        "serp": {
            "app": "app",
            "apps": "apps",
            "found and": " found and ",
            "with": "with",
            "in the title.": "in the title.",
            "your search": "Your search – ",
            "did not match any apps": " – did not match any apps.",
            "suggestions": "Suggestions:",
            "make sure all words are spelled correctly": "Make sure all words are spelled correctly.",
            "try different or more general keywords": "Try different or more general keywords.",
            "try wild card search": "Try wild card search (example: math* will find apps matching both maths and mathematics)",
            "try keywords in phrase within quotes": "Try keywords in phrase within quotes (example: “Winnie the pooh” will find apps matching the whole phrase. Not Winnie or Pooh only.)",
            "help": "Help",
            "still not sure what you are looking for": "Still not sure what you are looking for? Try the ",
            "feed": "Feed"
        },
        "paginator": {
            "next": "Next",
            "previous": "Prev"
        },
        "b-dropdowna": {
            "more": "more",
            "or": "or"
        },
        "serp-filter": {
            "all": "All",
            "cost": "Cost",
            "platforms": "Platforms",
            "categories": "Categories",
            "rating": "Rating",
            "result filter": "Result Filter",
            "Books & Reference": "Books & Reference",
            "Business": "Business",
            "Education": "Education",
            "Entertainment": "Entertainment",
            "Finance": "Finance",
            "Games": "Games",
            "Health & Fitness": "Health & Fitness",
            "Lifestyle": "Lifestyle",
            "Media & Video": "Media & Video",
            "Medical": "Medical",
            "Music & Audio": "Music & Audio",
            "Navigation": "Navigation",
            "News & Magazines": "News & Magazines",
            "Photography": "Photography",
            "Productivity": "Productivity",
            "Shopping": "Shopping",
            "Social": "Social",
            "Sports": "Sports",
            "Travel & Local": "Travel & Local",
            "Utilities": "Utilities",
            "Weather": "Weather",
            "Personalization": "Personalization",
            "free": "Free",
            "paid": "Paid"
        },
        "serp-hint": {
            "your query seems too generic": "Your query seems too generic.",
            "your query marches one of the app categories": "Your query marches one of the app categories. You can directly browse the apps under ",
            "narrow your search by adding more words to your query and/or by selecting result bins below": "Narrow your search by adding more words to your query and/or by selecting result bins below.",
            "did you mean": "Did you mean ",
            "hint": "Hint"
        },
        "serp-sort": {
            "relevance": "Relevance",
            "popularity": "Popularity",
            "alphabetical": "Alphabetical",
            "rating": "Star rating",
            "sort by": "Sort by"
        },
        "explore-view": {
            "explore view": "Explore View for "
        },
        "tags": {
            "result bins": "Result bins"
        },
        "store-badges": {
            "it all starts here": "It all starts here.",
            "ios app coming soon": "iOS app coming soon"
        },
        "appcurl-footer": {
            "more options": "More options",
            "сopyright at airomo.com": "Copyright at airomo.com",
            "about us": "ABOUT US",
            "appcurl apps": "APPCURL APPS",
            "links": "LINKS",
            "social media": "SOCIAL MEDIA",
            "about us content": "Appcurl is an app built over the airomo cloud. Airomo cloud is the mobile cloud platform from <a class=\"b-link\" href=\"http://www.airomo.com/company/\">Airomo Inc.</a>, the mobile lifestyle management company.",
            "google play": "Google Play",
            "amazon app store": "Amazon app store",
            "nook app store": "Nook app store",
            "apple app store": "Apple app store",
            "facebook app store": "Facebook app store",
            "submit apps": "Submit apps",
            "appcurl blogs": "Appcurl blogs",
            "how to guides": "How to guides",
            "airomo privacy policy": "Airomo Privacy policy"
        }
    },
    "ru": {
        "b-page": {
            "page title": "Appcurl  Находи лучшие Android и iPhone приложения с AppCurl – Мобильная поисковая система для социоголиков!",
            "username": "Вы",
            "login": "Войти",
            "my profile": "Мой профиль",
            "settings": "Настройки",
            "log out": "Выйти"
        },
        "popup": {
            "why appcurl": "Почему Appcurl?",
            "what is appcurl text": "Appcurl - поисковая система объединяет мобильные и социальные привычки пользователей, чтобы предоставить наиболее точные результаты поиска, соответствующие пользователю. Поиск Appcurl использует аналитику из нескольких источников, интернета, социальных сетей и рейтинга мобильных приложений, для того чтобы предоставить персональный список лучших Android и iPhone приложений. Appcurl это не просто поисковая система, которая обеспечивает точные и релевантные результаты, но и социальная платформа, которая позволяет находить приложения других пользователей, друзей, семьи и экспертов. С Appcurl, можно искать по ключевым словам программы, просматривать приложения по категориям или тегам, и следить за мобильными устройствами других пользователей, чтобы находить приложения в новом ключе.",
            "appcurl unibased text": "Appcurl абсолютно беспристрастно. Appcurl не способствует продаже каких-либо приложений. Appcurl считает, что истинные ценители мобильных приложений являются пользователи, он поощряет их, чтобы получать опыт пользования приложениями и влиять на мир вокруг них.",
            "example usage": ""
        },
        "appcurl-search": {
            "search mobile apps": "Поиск приложений, игр...",
            "search": "Найти"
        },
        "progress": {
            "searching": "Поиск..."
        },
        "option": {
            "en": "English",
            "ru": "Русский",
            "uk": "Українська",
            "zh": "中文",
            "pt": "Português",
            "jp": "日本語",
            "kr": "한국어",
            "es": "Español"
        },
        "appcurl-static-links": {
            "explore": "Исследуй",
            "apps": "приложения",
            "games": "игры",
            "users": "пользователей"
        },
        "serp": {
            "app": "приложение",
            "apps": "приложений",
            "found and": " найдено и ",
            "with": "с",
            "in the title.": "в заголовке",
            "your search": "По вашему запросу - ",
            "did not match any apps": " - приложений не найдено.",
            "suggestions": "Советы:",
            "make sure all words are spelled correctly": "Убедитесь что все слова написаны правильно.",
            "try different or more general keywords": "Попробуйте использовать использовать другие словосочетания.",
            "try wild card search": "Попробуйте использовать не точный поиск (например мат* найдет приложения математика и математический)",
            "try keywords in phrase within quotes": "Попробуйте взять ключевые слова или фразу в кавычки (например: Винни-Пух найдет приложения для всей фразы Винни-Пух и не только.",
            "help": "помощник",
            "still not sure what you are looking for": "Все еще не уверены что ищите? Попробуйте ",
            "feed": "Лента активности"
        },
        "paginator": {
            "next": "Вперед",
            "previous": "Назад"
        },
        "b-dropdowna": {
            "more": "ещё",
            "or": "или"
        },
        "serp-filter": {
            "all": "Все",
            "cost": "Стоимость",
            "platforms": "Платформа",
            "categories": "Категории",
            "rating": "Рейтинг",
            "result filter": "Фильтр результатов",
            "Books & Reference": "Книги и Учебники",
            "Business": "Бизнес",
            "Education": "Образование",
            "Entertainment": "Развлечения",
            "Finance": "Финансы",
            "Games": "Игры",
            "Health & Fitness": "Здоровье и Фитнесс",
            "Lifestyle": "Стиль жизни",
            "Media & Video": "Медиа и Видео",
            "Medical": "Медицина",
            "Music & Audio": "Аудио и Видео",
            "Navigation": "Навигация",
            "News & Magazines": "Новости и Журналы",
            "Photography": "Фотография",
            "Productivity": "Продуктивность",
            "Shopping": "Покупки",
            "Social": "Социальщина",
            "Sports": "Спорт",
            "Travel & Local": "Путешествия",
            "Utilities": "Утилиты",
            "Weather": "Погода",
            "Personalization": "Персонализация",
            "free": "Бесплатно",
            "paid": "Платно"
        },
        "serp-hint": {
            "your query seems too generic": "Ваш запрос выглядит слишком обобщенным.",
            "narrow your search by adding more words to your query and/or by selecting result bins below": "Вы можете сузить поиск выбрав дополнительное слово(а) из предложенных ниже.",
            "your query marches one of the app categories": "Ваш запрос сходиться с одной из категории приложений. Вы можете напрямую просматривать приложения под ",
            "did you mean": "Возможно вы имели ввиду ",
            "hint": "Подсказка"
        },
        "serp-sort": {
            "relevance": "Релевантности",
            "popularity": "Популярности",
            "alphabetical": "Алфавиту",
            "rating": "Рейтингу",
            "sort by": "Сортировать по"
        },
        "explore-view": {
            "explore view": "Explore View for "
        },
        "tags": {
            "result bins": "Теги"
        },
        "store-badges": {
            "it all starts here": "Все начинается здесь.",
            "ios app coming soon": "Приложение для iOs, скоро будет"
        },
        "appcurl-footer": {
            "more options": "More options",
            "сopyright at airomo.com": "Copyright at airomo.com",
            "about us": "ABOUT US",
            "appcurl apps": "APPCURL APPS",
            "links": "LINKS",
            "social media": "SOCIAL MEDIA",
            "about us content": "Appcurl is an app built over the airomo cloud. Airomo cloud is the mobile cloud platform from <a class=\"b-link\" href=\"http://www.airomo.com/company/\">Airomo Inc.</a>, the mobile lifestyle management company.",
            "google play": "Google Play",
            "amazon app store": "Amazon app store",
            "nook app store": "Nook app store",
            "apple app store": "Apple app store",
            "facebook app store": "Facebook app store",
            "submit apps": "Submit apps",
            "appcurl blogs": "Appcurl blogs",
            "how to guides": "How to guides",
            "airomo privacy policy": "Airomo Privacy policy"
        }
    },
    "uk": {
        "b-page": {
            "page title": "Appcurl Знаходь кращі Android и iPhone програми с AppCurl – Мобільна пошукова система для соціоголіков!",
            "username": "Ви",
            "login": "Увійти",
            "my profile": "Мій профіль",
            "settings": "Налаштування",
            "log out": "Вийти"
        },
        "popup": {
            "why appcurl": "Чому Appcurl?",
            "what is appcurl text": "Appcurl - Пошукова система об'єднує мобільні та соціальні звички користувачів, щоб надати найбільш точні результати пошуку, відповідні користувачеві. Пошук Appcurl використовує аналітику з декількох джерел, інтернету, соціальних мереж і рейтингу мобільних програм, для того щоб надати персональний список кращих Android і iPhone програм. Appcurl це не просто пошукова система, яка забезпечує точні і релевантні результати, а й соціальна платформа, яка дозволяє знаходити програми інших користувачів, друзів, сім'ї і експертів. З Appcurl, можна шукати за ключовими словами програми, переглядати програми за категоріями або тегам, і стежити за мобільними пристроями інших користувачів, щоб знаходити програми в новому ключі.",
            "appcurl unibased text": "Appcurl абсолютно неупереджено. Appcurl не сприяє продажу будь-яких програм. Appcurl вважає, що справжні цінителі мобільних програм є користувачі, він заохочує їх, щоб отримувати досвід користування програмами та впливати на світ навколо них.",
            "example usage": ""
        },
        "appcurl-search": {
            "search mobile apps": "Пошук мобільних програм, ігор...",
            "search": "Знайти"
        },
        "progress": {
            "searching": "Пошук..."
        },
        "option": {
            "en": "English",
            "ru": "Русский",
            "uk": "Українська",
            "zh": "中文",
            "pt": "Português",
            "jp": "日本語",
            "kr": "한국어",
            "es": "Español"
        },
        "appcurl-static-links": {
            "explore": "Досліджуй",
            "apps": "програми",
            "games": "ігри",
            "users": "користувачів"
        },
        "serp": {
            "app": "програма",
            "apps": "програм",
            "found and": " знайдено і ",
            "with": "з",
            "in the title.": "у заголовці",
            "your search": "По вашому запиту - ",
            "did not match any apps": " - програм не знайдено.",
            "suggestions": "Поради:",
            "make sure all words are spelled correctly": "Переконайтеся що всі слова написані правильно.",
            "try different or more general keywords": "Спробуйте використовувати інші словосполучення.",
            "try wild card search": "Спробуйте використовувати не точний пошук (наприклад мат* знайде додатка математика і математичний)",
            "try keywords in phrase within quotes": "Спробуйте взяти ключові слова або фразу в лапки (наприклад: Вінні-Пух знайде програми для всієї фрази Вінні-Пух і не тільки.",
            "help": "помічник",
            "still not sure what you are looking for": "Усе ще не впевнені що шукайте? Спробуйте ",
            "feed": "Стрічка активності"
        },
        "paginator": {
            "next": "Вперед",
            "previous": "Назад"
        },
        "b-dropdowna": {
            "more": "ще",
            "or": "або"
        },
        "serp-filter": {
            "all": "Всі",
            "cost": "Вартість",
            "platforms": "Платформа",
            "categories": "Категорії",
            "rating": "Рейтинг",
            "result filter": "Фільтр результатів",
            "Books & Reference": "Книги та Підручники",
            "Business": "Бізнес",
            "Education": "Освіта",
            "Entertainment": "Розваги",
            "Finance": "Фінанси",
            "Games": "Ігри",
            "Health & Fitness": "Здоров'я та Фітнес",
            "Lifestyle": "Стиль життя",
            "Media & Video": "Медіа і Відео",
            "Medical": "Медичні",
            "Music & Audio": "Аудіо і Відео",
            "Navigation": "Навігація",
            "News & Magazines": "Новини та Журнали",
            "Photography": "Фотографія",
            "Productivity": "Продуктивність",
            "Shopping": "Покупки",
            "Social": "Соціальщіна",
            "Sports": "Спорт",
            "Travel & Local": "Подорожі",
            "Utilities": "Утиліти",
            "Weather": "Погода",
            "Personalization": "Персоналізація",
            "free": "Безкоштовно",
            "paid": "Платно"
        },
        "serp-hint": {
            "your query seems too generic": "Ваш запит виглядає занадто узагальненим.",
            "narrow your search by adding more words to your query and/or by selecting result bins below": "Ви можете звузити пошук вибравши додаткове слово (а) із запропонованих нижче.",
            "your query marches one of the app categories": "Ваш запит сходиться з однією з категорії програм. Ви можете безпосередньо переглядати програми під ",
            "did you mean": "Можливо ви мали на увазі ",
            "hint": "Підказка"
        },
        "serp-sort": {
            "relevance": "Релевантності",
            "popularity": "Популярності",
            "alphabetical": "Алфавіту",
            "rating": "Рейтингу",
            "sort by": "Сортувати по"
        },
        "explore-view": {
            "explore view": "Explore View for "
        },
        "tags": {
            "result bins": "Тегі"
        },
        "store-badges": {
            "it all starts here": "Все починається тут.",
            "ios app coming soon": "Програма для iOs, скоро буде"
        },
        "appcurl-footer": {
            "more options": "More options",
            "сopyright at airomo.com": "Copyright at airomo.com",
            "about us": "ABOUT US",
            "appcurl apps": "APPCURL APPS",
            "links": "LINKS",
            "social media": "SOCIAL MEDIA",
            "about us content": "Appcurl is an app built over the airomo cloud. Airomo cloud is the mobile cloud platform from <a class=\"b-link\" href=\"http://www.airomo.com/company/\">Airomo Inc.</a>, the mobile lifestyle management company.",
            "google play": "Google Play",
            "amazon app store": "Amazon app store",
            "nook app store": "Nook app store",
            "apple app store": "Apple app store",
            "facebook app store": "Facebook app store",
            "submit apps": "Submit apps",
            "appcurl blogs": "Appcurl blogs",
            "how to guides": "How to guides",
            "airomo privacy policy": "Airomo Privacy policy"
        }
    },
    "pt": {
        "b-page": {
            "page title": "Appcurl : Descubra as melhores apps para Android e iPhone com AppCurl – O Motor de Busca Social de Apps Móveis ",
            "username": "você",
            "login": "Login",
            "my profile": "Meu Perfil",
            "settings": "Definições",
            "log out": "Sair"
        },
        "popup": {
            "why appcurl": "Porquê Appcurl?",
            "what is appcurl text": "O motor de busca de apps Appcurl combina de forma perfeita os hábitos móveis sociais online do usuário para fornecer os resultados de busca mais acertados e relevantes. A busca de apps Appcurl usa análises de múltiplas fontes; web, mídia sociais e móveis; para classificar, filtrar e fornecer uma lista personalizada das melhores apps para android e iPhone. Appcurl não é apenas o motor de busca de apps que fornece resultados acertados e relevantes, é também uma plataforma social que lhe permite descobrir apps de outros usuários; amigos, família e peritos. Com Appcurl pode buscar apps por palavras-chave, pesquisar apps por categorias ou tags, e seguir outros usuários para descobrir apps de uma forma completamente diferente.",
            "appcurl unibased text": " Appcurl é totalmente isento. Appcurl não promove ou vende quaisquer apps. Appcurl acredita que os verdadeiros peritos em aplicações móveis são os próprios usuários; Appcurl encoraja os usuários a se exprimirem em relação às suas apps e a influenciarem o mundo à sua volta.",
            "example usage": ""
        },
        "appcurl-search": {
            "search mobile apps": "Procurar apps, jogos…",
            "search": "Procurar"
        },
        "progress": {
            "searching": "Buscando..."
        },
        "option": {
            "en": "English",
            "ru": "Русский",
            "uk": "Українська",
            "zh": "中文",
            "pt": "Português",
            "jp": "日本語",
            "kr": "한국어",
            "es": "Español"
        },
        "appcurl-static-links": {
            "explore": "Explorar",
            "apps": "apps",
            "games": "jogos",
            "users": "usuários"
        },
        "serp": {
            "app": "app",
            "apps": "apps",
            "found and": " encontradas e ",
            "with": "com",
            "in the title.": "no título.",
            "your search": "Sua busca - ",
            "did not match any apps": " – nenhuma app corresponde.",
            "suggestions": "Sugestões:",
            "make sure all words are spelled correctly": "Verifique se todas as palavras estão bem escritas.",
            "try different or more general keywords": "Tente palavras-chave diferentes ou mais gerais.",
            "try wild card search": "Tente buscas wild card (exemplo: math* encontrará apps que coincidem tanto com maths como com mathematics)",
            "try keywords in phrase within quotes": "Tente palavras-chave em frases entre aspas (exemplo: 'Winnie the pooh' encontrará apps que coincidem com a frase completa e não apenas com Winnie ou Pooh.)",
            "help": "Ajuda",
            "still not sure what you are looking for": "Ainda sem certeza do que você busca? Tente o ",
            "feed": "Feed"
        },
        "paginator": {
            "next": "Próximo",
            "previous": "Anterior"
        },
        "b-dropdowna": {
            "more": "more",
            "or": "or"
        },
        "serp-filter": {
            "all": "Tudo",
            "cost": "Custo",
            "platforms": "Plataformas",
            "categories": "Categorias",
            "rating": "Classificação",
            "result filter": "Filtro de Resultados",
            "Books & Reference": "Livros e Referência",
            "Business": "Corporativo",
            "Education": "Educação",
            "Entertainment": "Entretenimento",
            "Finance": "Finanças",
            "Games": "Jogos",
            "Health & Fitness": "Saúde e Cond. Físico",
            "Lifestyle": "Estilo de Vida",
            "Media & Video": "Mídia e Vídeos",
            "Medical": "Medicina",
            "Music & Audio": "Música & Áudio",
            "Navigation": "Navegação",
            "News & Magazines": "Notícias e Revistas",
            "Photography": "Fotografia",
            "Productivity": "Produtividade",
            "Shopping": "Compras",
            "Social": "Social",
            "Sports": "Esportes",
            "Travel & Local": "Turismo e Local",
            "Utilities": "Utilidades",
            "Weather": "Clima",
            "Personalization": "Personalização",
            "free": "Grátis",
            "paid": "Paga"
        },
        "serp-hint": {
            "your query seems too generic": "Sua busca parece demasiado genérica.",
            "your query marches one of the app categories": "Sua busca corresponde a uma das categorias de apps. Pode navegar diretamente nas apps em ",
            "narrow your search by adding more words to your query and/or by selecting result bins below": "Limite sua busca adicionando mais palavras à sua consulta e/ou seleccionando os resultados abaixo.",
            "did you mean": "Queria dizer ",
            "hint": "Dica"
        },
        "serp-sort": {
            "relevance": "Relevância",
            "popularity": "Popularidade",
            "alphabetical": "Alfabética",
            "rating": "Classificação por estrelas",
            "sort by": "Ordenar por"
        },
        "explore-view": {
            "explore view": "Explore View for "
        },
        "tags": {
            "result bins": "Resultados"
        },
        "store-badges": {
            "it all starts here": "Tudo começa aqui.",
            "ios app coming soon": "iOS app brevemente"
        },
        "appcurl-footer": {
            "more options": "More options",
            "сopyright at airomo.com": "Copyright at airomo.com",
            "about us": "ABOUT US",
            "appcurl apps": "APPCURL APPS",
            "links": "LINKS",
            "social media": "SOCIAL MEDIA",
            "about us content": "Appcurl is an app built over the airomo cloud. Airomo cloud is the mobile cloud platform from <a class=\"b-link\" href=\"http://www.airomo.com/company/\">Airomo Inc.</a>, the mobile lifestyle management company.",
            "google play": "Google Play",
            "amazon app store": "Amazon app store",
            "nook app store": "Nook app store",
            "apple app store": "Apple app store",
            "facebook app store": "Facebook app store",
            "submit apps": "Submit apps",
            "appcurl blogs": "Appcurl blogs",
            "how to guides": "How to guides",
            "airomo privacy policy": "Airomo Privacy policy"
        }
    },
    "jp": {
        "b-page": {
            "page title": "ページタイトル Appcurl : #AppCurl で最高の #Android用、 #iPhone用アプリを見つけよう- ソーシャルネットワーキングサービスのためのモバイルアプリ検索エンジン",
            "username": "あなた",
            "login": "ログイン",
            "my profile": "マイプロフィール",
            "settings": "設定",
            "log out": "ログアウト"
        },
        "popup": {
            "why appcurl": "何故Appcurlが選ばれるのか?",
            "what is appcurl text": "Appcurlアプリ検索エンジンは、ユーザーのモバイルやネットでのSNSの習慣を違和感なく統合し、ユーザーに関連した最も正確な検索結果を収集します。 Appcurlのアプリサーチは、ネットやソーシャルメディア、モバイルなどの複数の情報源から得た統計を使って、ランク付けや、特定の情報を取捨選択し、その人独自にカスタマイズされた最良のアンドロイド用、iPhone用アプリのリストをお届けします。Appcurlは正確で適切な結果を集めるアプリ検索エンジンだけではなく、あなたが友達・家族・専門家など他のユーザーからアプリを見つけることができるソーシャルネットワークサービスでもあります。 Appcurlでは、キーワードでアプリを検索したり、カテゴリーまたはタグによってアプリを見るでき、また他のユーザーのモバイルデバイスに注目することで全く異なった方法でアプリを見つけることができます。",
            "appcurl unibased text": " Appcurlは全く公平です。  Appcurlではいかなるアプリのプロモーション、販売などはしておりません。Appcurlはモバイルアプリについて本当によく知っているのはユーザー自身だと考えるからです。当社ではユーザーに、自分自身のアプリについて経験したことを発言し、自分達の回りに影響を与えるよう奨励しています。 ",
            "example usage": ""
        },
        "appcurl-search": {
            "search mobile apps": "モバイルアプリを探す",
            "search": "検索"
        },
        "progress": {
            "searching": "検索中..."
        },
        "option": {
            "en": "English",
            "ru": "Русский",
            "uk": "Українська",
            "zh": "中文",
            "pt": "Português",
            "jp": "日本語",
            "kr": "한국어",
            "es": "Español"
        },
        "appcurl-static-links": {
            "explore": "詳細を検索",
            "apps": "アプリ",
            "games": "ゲーム",
            "users": "ユーザー"
        },
        "serp": {
            "app": "アプリ",
            "apps": "アプリ",
            "found and": "が見つかりました、そして ",
            "with": "を使って",
            "in the title.": "の名称で.",
            "your search": "あなたの検索結果- ",
            "did not match any apps": " - 該当するアプリがありません。",
            "suggestions": "アドバイス:",
            "make sure all words are spelled correctly": "全ての単語が正しく入力されているかどうかご確認ください。",
            "try different or more general keywords": "他のキーワード、またはより一般的なキーワードを試す.",
            "try wild card search": "ワイルドカードサーチを試す (例: math* という単語はmaths及び mathematics〔＊両方とも数学の意味〕の両方にマッチするアプリを探します。）",
            "try keywords in phrase within quotes": "TODO ADD TRANSLATION",
            "help": "ヘルプ",
            "still not sure what you are looking for": "まだ探しているものが確認できませんか?  ",
            "feed": "フィードをお試しください。"
        },
        "paginator": {
            "next": "次へ",
            "previous": "一つ前へ"
        },
        "b-dropdowna": {
            "more": "more",
            "or": "or"
        },
        "serp-filter": {
            "all": "全て",
            "cost": "価格",
            "platforms": "プラットフォーム",
            "categories": "カテゴリー",
            "rating": "評価",
            "result filter": "フィルター結果",
            "Books & Reference": "本と参考図書",
            "Business": "ビジネス",
            "Education": "教育",
            "Entertainment": "娯楽",
            "Finance": "ファイナンス・財務管理",
            "Games": "ゲーム",
            "Health & Fitness": "健康とフィットネス",
            "Lifestyle": "ライフスタイル",
            "Media & Video": "マルチメディアと動画",
            "Medical": "医療",
            "Music & Audio": "音楽とオーディオ",
            "Navigation": "ナビゲーション・GPS",
            "News & Magazines": "ニュースと雑誌",
            "Photography": "写真",
            "Productivity": "生産性",
            "Shopping": "ショッピング",
            "Social": "ソーシャルネットワーキング",
            "Sports": "スポーツ",
            "Travel & Local": "旅行と地域",
            "Utilities": "お役立ち情報",
            "Weather": "天気",
            "Personalization": "個人用カスタマイズ・パーソナライゼーション",
            "free": "無料",
            "paid": "有料"
        },
        "serp-hint": {
            "your query seems too generic": "質問が一般的すぎます。",
            "Your query maｔches one of the app categories. You can directly browse the apps under": "あなたの質問はアプリのカテゴリーの一つにマッチします。以下のアプリを直接閲覧してみてください。 ",
            "narrow your search by adding more words to your query and/or by selecting result bins below": "以下の中から検索結果を選び、あなたの質問に幾つかの単語を加えてながら（and/orで区切り）検索を絞り込んでください。",
            "did you mean": "～の意味ですか？ ",
            "hint": "ヒント"
        },
        "serp-sort": {
            "relevance": "関連性",
            "popularity": "人気度",
            "alphabetical": "アルファベット順",
            "rating": "星の数による評価",
            "sort by": "～による分類"
        },
        "explore-view": {
            "explore view": "Explore View for "
        },
        "tags": {
            "result bins": "検索結果一覧"
        },
        "store-badges": {
            "it all starts here": "全てはここから始まります。",
            "ios app coming soon": "iOS用アプリは近日発売"
        },
        "appcurl-footer": {
            "more options": "More options",
            "сopyright at airomo.com": "Copyright at airomo.com",
            "about us": "ABOUT US",
            "appcurl apps": "APPCURL APPS",
            "links": "LINKS",
            "social media": "SOCIAL MEDIA",
            "about us content": "Appcurl is an app built over the airomo cloud. Airomo cloud is the mobile cloud platform from <a class=\"b-link\" href=\"http://www.airomo.com/company/\">Airomo Inc.</a>, the mobile lifestyle management company.",
            "google play": "Google Play",
            "amazon app store": "Amazon app store",
            "nook app store": "Nook app store",
            "apple app store": "Apple app store",
            "facebook app store": "Facebook app store",
            "submit apps": "Submit apps",
            "appcurl blogs": "Appcurl blogs",
            "how to guides": "How to guides",
            "airomo privacy policy": "Airomo Privacy policy"
        }
    },
    "es": {
        "b-page": {
            "page title": "Appcurl : Descubre las mejores apps para Android y iPhone con AppCurl – El Motor de Búsqueda Social de Apps Móviles ",
            "username": "tu",
            "login": "Login",
            "my profile": "Mi Perfil",
            "settings": "Ajustes",
            "log out": "Cerrar sesión"
        },
        "popup": {
            "why appcurl": "Por qué Appcurl?",
            "what is appcurl text": "El motor de búsqueda de apps Appcurl combina de forma perfecta los hábitos móviles sociales online del usuario para entregar los resultados de búsqueda más precisos y pertinentes. La búsqueda de apps Appcurl usa analíticos de múltiples fuentes; web, multimédia social y móvil; para ordenar, filtrar y entregar una lista personalizada de las mejores apps para android y iPhone. Appcurl no es solamente un motor de búsqueda de apps que entrega resultados precisos y pertinentes, sino también una plataforma social que permite descubrir apps de otros usuarios; amigos, familiares y expertos. Con Appcurl puedes buscar apps por palabra clave, por categorías o por tags, y seguir otros usuarios para descubrir apps de modo totalmente distinto.",
            "appcurl unibased text": " Appcurl es totalmente imparcial. Appcurl no fomenta ni vende cualquier app. Appcurl cree que los verdaderos expertos en apps móviles son los usuarios. Appcurl anima los usuarios a manifestarse acerca de sus apps y influenciar el mundo a su alrededor.",
            "example usage": ""
        },
        "appcurl-search": {
            "search mobile apps": "Buscar apps, juegos...",
            "search": "Buscar"
        },
        "progress": {
            "searching": "Buscando..."
        },
        "option": {
            "en": "English",
            "ru": "Русский",
            "uk": "Українська",
            "zh": "中文",
            "pt": "Português",
            "jp": "日本語",
            "kr": "한국어",
            "es": "Español"
        },
        "appcurl-static-links": {
            "explore": "Explorar",
            "apps": "apps",
            "games": "juegos",
            "users": "usuarios"
        },
        "serp": {
            "app": "app",
            "apps": "apps",
            "found and": " encontradas y ",
            "with": "con",
            "in the title.": "en el título.",
            "your search": "Su búsqueda - ",
            "did not match any apps": " – ninguna app coincide.",
            "suggestions": "Sugerencias:",
            "make sure all words are spelled correctly": "Compruebe que todas las palabras están bien escritas.",
            "try different or more general keywords": "Intente palabras clave diferentes o más generales.",
            "try wild card search": "Intente búsquedas wild card search (ejemplo: math* encontrará apps que coinciden tanto con maths como con mathematics)",
            "try keywords in phrase within quotes": "Intente palabras clave en frases entre comillas (ejemplo: 'Winnie the pooh' encontrará apps que coinciden con toda la frase y no solamente con Winnie o con Pooh.)",
            "help": "Ayuda",
            "still not sure what you are looking for": "¿Todavía no está seguro de lo que busca? Intente el ",
            "feed": "Feed"
        },
        "paginator": {
            "next": "Siguiente",
            "previous": "Anterior"
        },
        "b-dropdowna": {
            "more": "more",
            "or": "or"
        },
        "serp-filter": {
            "all": "Todo",
            "cost": "Costo",
            "platforms": "Plataformas",
            "categories": "Categorías",
            "rating": "Clasificación",
            "result filter": "Filtro de Resultados",
            "Books & Reference": "Libros y Obras de consulta",
            "Business": "Negocios",
            "Education": "Educación",
            "Entertainment": "Entretenimiento",
            "Finance": "Finanzas",
            "Games": "Juegos",
            "Health & Fitness": "Salud y Bienestar",
            "Lifestyle": "Estilo de Vida",
            "Media & Video": "Multimedia y Vídeo",
            "Medical": "Medicinal",
            "Music & Audio": "Música y Audio",
            "Navigation": "Navegación",
            "News & Magazines": "Noticias y Revistas",
            "Photography": "Fotografía",
            "Productivity": "Productividad",
            "Shopping": "Compras",
            "Social": "Sociedad",
            "Sports": "Deportes",
            "Travel & Local": "Viajes y Guías",
            "Utilities": "Utilidades",
            "Weather": "Tiempo",
            "Personalization": "Personalización",
            "free": "Gratis",
            "paid": "Pagada"
        },
        "serp-hint": {
            "your query seems too generic": "Su búsqueda parece muy genérica.",
            "your query marches one of the app categories": "Su búsqueda corresponde a una de las categorías de apps. Puede navegar directamente por las apps en ",
            "narrow your search by adding more words to your query and/or by selecting result bins below": "Limite su búsqueda añadiendo más palabras à su consulta y/o seleccionando los resultados abajo.",
            "did you mean": "Quería decir ",
            "hint": "Pista"
        },
        "serp-sort": {
            "relevance": "Relevancia",
            "popularity": "Popularidad",
            "alphabetical": "Alfabética",
            "rating": "Classificación por estrellas",
            "sort by": "Ordenar por"
        },
        "explore-view": {
            "explore view": "Explore View for "
        },
        "tags": {
            "result bins": "Resultados"
        },
        "store-badges": {
            "it all starts here": "Todo empieza aquí.",
            "ios app coming soon": "iOS app próximamente"
        },
        "appcurl-footer": {
            "more options": "More options",
            "сopyright at airomo.com": "Copyright at airomo.com",
            "about us": "ABOUT US",
            "appcurl apps": "APPCURL APPS",
            "links": "LINKS",
            "social media": "SOCIAL MEDIA",
            "about us content": "Appcurl is an app built over the airomo cloud. Airomo cloud is the mobile cloud platform from <a class=\"b-link\" href=\"http://www.airomo.com/company/\">Airomo Inc.</a>, the mobile lifestyle management company.",
            "google play": "Google Play",
            "amazon app store": "Amazon app store",
            "nook app store": "Nook app store",
            "apple app store": "Apple app store",
            "facebook app store": "Facebook app store",
            "submit apps": "Submit apps",
            "appcurl blogs": "Appcurl blogs",
            "how to guides": "How to guides",
            "airomo privacy policy": "Airomo Privacy policy"
        }
    },
    "kr": {
        "b-page": {
            "page title": "Appcurl : AppCurl과 함께 최고의 안드로이드와 아이폰 앱들을 찾아보세요- 사교적인 사람들을 위한 모바일 앱 검색 엔진 ",
            "username": "사용자 이름",
            "login": "로그인",
            "my profile": "나의 프로파일",
            "settings": "설정",
            "log out": "로그아웃"
        },
        "popup": {
            "why appcurl": "왜 Appcurl인가?",
            "what is appcurl text": "Appcurl 앱 검색 엔진은 사용자와 관련된 가장 정확한 검색 결과를 제공하기 위해 사용자의 모바일 소셜 습관들과 온라인 소셜 습관들을  완벽히 혼합합니다. Appcurl의 앱 검색은 최고의 안드로이드 및 아이폰 앱들의 개인화된 목록을 순위화하고, 거르며 전달하기위해 여러 출처로부터의 분석을 사용합니다; 웹, 소셜 미디어 및 모바일. Appcurl은 정확하고 관련도 있는 결과들을 전달해주는 앱 검색 엔진일뿐만 아니라, 당신이 다른 사용자들로부터 앱들을 발견할 수 있게 해주는 소셜 플랫폼이기도 합니다; 친구들 가족들 그리고 전문가들. Appcurl과 함께, 당신을 키워드들로 앱을 검색할 수도 있고, 카테고리나 테그들로 앱을 브라우즈할수 있으며, 완전히 다른 방식으로 앱들을 발견하기위해 다른 사용자들의 모바일 장치들을 팔로우할수도 있습니다.",
            "appcurl unibased text": "Appcurl은 완전히 중립적입니다. Appcurl은 어떤 앱도 홍보하거나 판매하지 않습니다.  Appcurl은 모바일 어플리케이션들의 진정한 전문가들은 사용자 그들자신이라는것을 믿고있습니다. 그것을 사용자들이 자신들의 앱 경험들을 최대한 활용하고 그들을 둘러싼 세상에 영향을 미치도록 장려합니다.",
            "example usage": ""
        },
        "appcurl-search": {
            "search mobile apps": " 앱들과 게임들을 검색합니다...",
            "search": "검색하다"
        },
        "progress": {
            "searching": "검색중..."
        },
        "option": {
            "en": "English",
            "ru": "Русский",
            "uk": "Українська",
            "zh": "中文",
            "pt": "Português",
            "jp": "日本語",
            "kr": "한국어",
            "es": "Español"
        },
        "appcurl-static-links": {
            "explore": "탐험하다",
            "apps": "앱들",
            "games": "게임들",
            "users": "사용자들"
        },
        "serp": {
            "app": "앱",
            "apps": "앱들",
            "found and": " 찾음 그리고",
            "with": "와 함께",
            "in the title.": "제목 내에서.",
            "your search": "당신의 검색",
            "did not match any apps": " – 는 어떤 앱과도 매치하지 않았습니다.",
            "suggestions": "제안들:",
            "make sure all words are spelled correctly": "모든 단어들의 철자가 올바르게 쓰여졌는지 확인하십시오 .",
            "try different or more general keywords": "다르거나 좀더 일반적인 키워드들로 시도하십시오.",
            "try wild card search": "와일드 카드 검색을 시도하십시오 (예시: math* 는 maths 와mathematics 둘다에 매치되는 앱들을 찾을것입니다.)",
            "try keywords in phrase within quotes": "인용구내에 어구에 쓰인 키워드들로 시도하십시오  (예시: 'Winnie the pooh' 는 Winnie 혹은 Pooh만이 아닌 전체 어구와 매치되는 앱들을 찾을것입니다.)",
            "help": "도움",
            "still not sure what you are looking for": "Still not sure what you are looking for? Try the 아직도 귀하께서 무엇을 찾고 계신지 확신하지 않으십니까? ",
            "feed": "피드"
        },
        "paginator": {
            "next": "다음",
            "previous": "이전"
        },
        "b-dropdowna": {
            "more": "more",
            "or": "or"
        },
        "serp-filter": {
            "all": "모두",
            "cost": "비용",
            "platforms": "플랫폼",
            "categories": "카테고리들",
            "rating": "평가하기",
            "result filter": "결과 필터",
            "Books & Reference": "도서 & 참고문헌",
            "Business": "비지니스",
            "Education": "교육",
            "Entertainment": "엔터테인먼트",
            "Finance": "금융",
            "Games": "게임들",
            "Health & Fitness": "건강 & 휘트니스",
            "Lifestyle": "라이프스타일",
            "Media & Video": "미디어 & 비디오",
            "Medical": "의료",
            "Music & Audio": "음악 & 오디오",
            "Navigation": "내비게이션",
            "News & Magazines": "뉴스 & 매거진",
            "Photography": "사진(포토그래피)",
            "Productivity": "생산성",
            "Shopping": "쇼핑",
            "Social": "소셜",
            "Sports": "스포츠",
            "Travel & Local": "여행 & 지역",
            "Utilities": "유틸리티",
            "Weather": "날씨",
            "Personalization": "개인화",
            "free": "무료",
            "paid": "지불됨"
        },
        "serp-hint": {
            "your query seems too generic": " 검색어가 너무 일반적인 것 같습니다.",
            "your query marches one of the app categories": " 당신의 질문이 앱 카테고리들중 하나와 매치합니다. 귀하께서는 곧장 밑에 있는 앱들을 열람하실수있습니다 ",
            "narrow your search by adding more words to your query and/or by selecting result bins below": "귀하의 질문에 단어들을 더하거나 아래에 있는 결과 빈(bin)들을 선택함으로써 당신의 검색의 범위를 좁힐 수 있습니다. ",
            "did you mean": "을 의미하시나요 ",
            "hint": "힌트"
        },
        "serp-sort": {
            "relevance": "관련도",
            "popularity": "인기도",
            "alphabetical": "알파벳의",
            "rating": "평가하기",
            "sort by": "에 따라 분류합니다"
        },
        "explore-view": {
            "explore view": "Explore View for "
        },
        "tags": {
            "result bins": "결과 빈(bin)들"
        },
        "store-badges": {
            "it all starts here": "그것은 모두 여기에서 시작합니다..",
            "ios app coming soon": "iOS 앱이 곧 나옵니다"
        },
        "appcurl-footer": {
            "more options": "More options",
            "сopyright at airomo.com": "Copyright at airomo.com",
            "about us": "ABOUT US",
            "appcurl apps": "APPCURL APPS",
            "links": "LINKS",
            "social media": "SOCIAL MEDIA",
            "about us content": "Appcurl is an app built over the airomo cloud. Airomo cloud is the mobile cloud platform from <a class=\"b-link\" href=\"http://www.airomo.com/company/\">Airomo Inc.</a>, the mobile lifestyle management company.",
            "google play": "Google Play",
            "amazon app store": "Amazon app store",
            "nook app store": "Nook app store",
            "apple app store": "Apple app store",
            "facebook app store": "Facebook app store",
            "submit apps": "Submit apps",
            "appcurl blogs": "Appcurl blogs",
            "how to guides": "How to guides",
            "airomo privacy policy": "Airomo Privacy policy"
        }
    },
    "zh": {
        "b-page": {
            "page title": "Appcurl：使用#Appcurl—— 带有社交倾向的的移动应用搜索引擎，发现最好的#Android和#iPhone应用。",
            "username": "您",
            "login": "登陆",
            "my profile": "我的档案",
            "settings": "设置",
            "log out": "退出"
        },
        "popup": {
            "why appcurl": "为什么是Appcurl?",
            "what is appcurl text": "Appcurl应用搜索引擎将用户的手机及线上社交习惯无缝集成，以提供与用户相关的最准确的搜索结果。Appcurl的应用搜索使用来自多个源头的分析结果：网络、社交媒体及手机，以排名、过滤并提供一份个性化的最优Android及iPhone应用的列表。Appcurl不仅是一个提供准确且相关的结果的应用搜索引擎，也是一个让您从其他用户处，如朋友、家人及专家等，发现应用的社交平台。有了Appcurl，您能够用完全不同的方式，按关键字搜索应用，按类别或者标签浏览应用，并关注其他用户的移动设备以发现应用。",
            "appcurl unibased text": " Appcurl是完全公正的。 Appcurl不推广或者销售应用。 Appcurl相信真正的移动应用专家就是用户自身，它鼓励用户大声说出他们使用应用的经历并影响他们周围的世界。",
            "example usage": ""
        },
        "appcurl-search": {
            "search mobile apps": "搜索应用、游戏……",
            "search": "搜索"
        },
        "progress": {
            "searching": "正在搜索……"
        },
        "option": {
            "en": "English",
            "ru": "Русский",
            "uk": "Українська",
            "zh": "中文",
            "pt": "Português",
            "jp": "日本語",
            "kr": "한국어",
            "es": "Español"
        },
        "appcurl-static-links": {
            "explore": "探索",
            "apps": "应用",
            "games": "游戏",
            "users": "用户"
        },
        "serp": {
            "app": "应用",
            "apps": "应用",
            "found and": "被找到并且",
            "with": "带有",
            "in the title.": "于标题中",
            "your search": "您的搜索—— ",
            "did not match any apps": "——未匹配上任何应用。",
            "suggestions": "建议：",
            "make sure all words are spelled correctly": "确保所有字词拼写正确。",
            "try different or more general keywords": "试试不同的或者更一般化的关键字。",
            "try wild card search": "试试通配符搜索（例如： math*会搜到与maths及mathematics相匹配的应用）",
            "try keywords in phrase within quotes": "试试位于引号内的短语关键字（例如： “Winnie the pooh”将搜到与整个短语，而非单个Winnie或者Pooh相匹配的应用。）",
            "help": "帮助",
            "still not sure what you are looking for": "仍不确定您在搜寻什么？试试",
            "feed": "收取点"
        },
        "paginator": {
            "next": "下一个",
            "previous": "上一个"
        },
        "b-dropdowna": {
            "more": "more",
            "or": "or"
        },
        "serp-filter": {
            "all": "所有",
            "cost": "费用",
            "platforms": "平台",
            "categories": "类别",
            "rating": "评分",
            "result filter": "结果过滤器",
            "Books & Reference": "图书与工具书",
            "Business": "公司",
            "Education": "教育",
            "Entertainment": "娱乐",
            "Finance": "财经",
            "Games": "游戏",
            "Health & Fitness": "保健及健身",
            "Lifestyle": "生活方式",
            "Media & Video": "媒体与视频",
            "Medical": "医药",
            "Music & Audio": "音乐与音频",
            "Navigation": "导航",
            "News & Magazines": "新闻杂志",
            "Photography": "摄影",
            "Productivity": "效率",
            "Shopping": "购物",
            "Social": "社交",
            "Sports": "体育",
            "Travel & Local": "旅游及本地出行",
            "Utilities": "使用工具",
            "Weather": "天气",
            "Personalization": "个性化",
            "free": "免费",
            "paid": "付费"
        },
        "serp-hint": {
            "your query seems too generic": "您的查询看起来太过宽泛。",
            "your query marches one of the app categories": "您的查询匹配了一个应用类别。您能够直接浏览应用于 ",
            "narrow your search by adding more words to your query and/or by selecting result bins below": "向您的查询添加更多的字词并/或选择下面的结果箱，以缩小搜索范围。",
            "did you mean": "您的意思是? ",
            "hint": "提示"
        },
        "serp-sort": {
            "relevance": "相关性",
            "popularity": "流行度",
            "alphabetical": "字母顺序",
            "rating": "星级评分",
            "sort by": "排序"
        },
        "explore-view": {
            "explore view": "Explore View for "
        },
        "tags": {
            "result bins": "结果箱"
        },
        "store-badges": {
            "it all starts here": "一切由此开始",
            "ios app coming soon": "iOS应用即将到来"
        },
        "appcurl-footer": {
            "more options": "More options",
            "сopyright at airomo.com": "Copyright at airomo.com",
            "about us": "ABOUT US",
            "appcurl apps": "APPCURL APPS",
            "links": "LINKS",
            "social media": "SOCIAL MEDIA",
            "about us content": "Appcurl is an app built over the airomo cloud. Airomo cloud is the mobile cloud platform from <a class=\"b-link\" href=\"http://www.airomo.com/company/\">Airomo Inc.</a>, the mobile lifestyle management company.",
            "google play": "Google Play",
            "amazon app store": "Amazon app store",
            "nook app store": "Nook app store",
            "apple app store": "Apple app store",
            "facebook app store": "Facebook app store",
            "submit apps": "Submit apps",
            "appcurl blogs": "Appcurl blogs",
            "how to guides": "How to guides",
            "airomo privacy policy": "Airomo Privacy policy"
        }
    }
})
