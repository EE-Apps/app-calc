class CurrencyConverter {
    constructor() {
        this.rates = {};
        this.lastUpdate = null;
        this.updateInterval = 3600000; // обновление каждый час
    }

    async init() {
        await this.updateRates();
        setInterval(() => this.updateRates(), this.updateInterval);
    }

    async updateRates() {
        try {
            // Загружаем курсы от Agroprombank (локальные валюты)
            await this.loadAgroprombank();
            
            // Загружаем глобальные курсы от OpenExchangeRates
            await this.loadOpenExchangeRates();
            
            this.lastUpdate = new Date();
            console.log('Курсы валют обновлены', this.rates);
        } catch (error) {
            console.error('Ошибка при обновлении курсов:', error);
        }
    }

    async loadAgroprombank() {
        try {
            // Используем CORS прокси для обхода ограничений
            const corsProxy = 'https://cors-anywhere.herokuapp.com/';
            const url = 'https://www.agroprombank.com/xmlinformer.php';
            
            let response;
            try {
                // Сначала пробуем напрямую
                response = await fetch(url, { mode: 'cors' });
            } catch (e) {
                // Если не получится, используем прокси
                response = await fetch(corsProxy + url);
            }
            
            if (!response.ok) throw new Error('HTTP ' + response.status);
            
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            // Проверяем на ошибку парса
            if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
                throw new Error('XML parse error');
            }
            
            // Парсим официальный курс (MDL базовая валюта)
            const officialCourse = xmlDoc.querySelector('course[type="official"]');
            if (officialCourse) {
                const currencies = officialCourse.querySelectorAll('currency');
                currencies.forEach(curr => {
                    const code = curr.getAttribute('code');
                    const rate = parseFloat(curr.textContent);
                    if (!isNaN(rate) && rate > 0) {
                        // Курс: 1 MDL = rate другой валюты
                        this.rates[`MDL_${code}`] = rate;
                        this.rates[`${code}_MDL`] = 1 / rate;
                    }
                });
            }

            // Парсим интернет-банк для дополнительных пар
            const internetCourse = xmlDoc.querySelector('course[type="internetbank"]');
            if (internetCourse) {
                const currencies = internetCourse.querySelectorAll('currency');
                currencies.forEach(curr => {
                    const codeSell = curr.getAttribute('codeSell');
                    const codeBuy = curr.getAttribute('codeBuy');
                    const sellElem = curr.querySelector('currencySell');
                    const buyElem = curr.querySelector('currencyBuy');
                    
                    if (sellElem && buyElem) {
                        const sell = parseFloat(sellElem.textContent);
                        const buy = parseFloat(buyElem.textContent);
                        
                        if (!isNaN(sell) && !isNaN(buy) && sell > 0 && buy > 0) {
                            const rate = (sell + buy) / 2; // Средний курс
                            this.rates[`${codeSell}_${codeBuy}`] = rate;
                            this.rates[`${codeBuy}_${codeSell}`] = 1 / rate;
                        }
                    }
                });
            }
            
            console.log('Курсы Agroprombank загружены:', Object.keys(this.rates).length);
        } catch (error) {
            console.warn('Не удалось загрузить курсы Agroprombank:', error.message);
        }
    }

    async loadOpenExchangeRates() {
        try {
            const response = await fetch('https://open.er-api.com/v6/latest/USD');
            if (!response.ok) throw new Error('ExchangeRate API недоступен');
            
            const data = await response.json();
            
            if (!data.rates) throw new Error('Неверный формат данных');
            
            // Сохраняем курсы относительно USD
            Object.keys(data.rates).forEach(code => {
                this.rates[`USD_${code}`] = data.rates[code];
                this.rates[`${code}_USD`] = 1 / data.rates[code];
            });
            
            console.log('Курсы ExchangeRate API загружены:', Object.keys(this.rates).length);
        } catch (error) {
            console.warn('Не удалось загрузить курсы ExchangeRate API:', error.message);
            // Fallback: используем статические курсы
            this.loadFallbackRates();
        }
    }

    loadFallbackRates() {
        // Статические курсы на случай, если API недоступны
        // Все курсы относительно USD
        const fallback = {
            // USD к другим
            'USD_EUR': 0.92,
            'EUR_USD': 1.09,
            'USD_GBP': 0.79,
            'GBP_USD': 1.27,
            'USD_JPY': 149.50,
            'JPY_USD': 0.0067,
            'USD_CNY': 7.24,
            'CNY_USD': 0.138,
            'USD_INR': 83.12,
            'INR_USD': 0.012,
            'USD_AUD': 1.53,
            'AUD_USD': 0.653,
            'USD_CAD': 1.36,
            'CAD_USD': 0.735,
            'USD_CHF': 0.89,
            'CHF_USD': 1.12,
            // Локальные валюты (относительно USD)
            'USD_MDL': 17.8,
            'MDL_USD': 0.0562,
            'USD_RUB': 95.50,
            'RUB_USD': 0.0105,
            'USD_RUP': 74.0, // Приднестровский рубль
            'RUP_USD': 0.0135,
            'USD_UAH': 40.5,
            'UAH_USD': 0.0247,
            // Локальные пары
            'EUR_MDL': 19.35,
            'MDL_EUR': 0.0517,
            'EUR_RUB': 103.5,
            'RUB_EUR': 0.00966,
            'MDL_RUB': 5.35,
            'RUB_MDL': 0.187
        };
        
        Object.assign(this.rates, fallback);
    }

    /**
     * Конвертирует сумму из одной валюты в другую
     * @param {number} amount - сумма
     * @param {string} fromCode - код валюты (откуда)
     * @param {string} toCode - код валюты (куда)
     * @returns {number} конвертированная сумма
     */
    convert(amount, fromCode, toCode) {
        if (fromCode === toCode) return amount;
        if (amount === 0) return 0;

        const key = `${fromCode}_${toCode}`;
        
        // Если есть прямой курс
        if (this.rates[key]) {
            return amount * this.rates[key];
        }

        // Специальная логика для RUP (приднестровский рубль)
        // Если нужно конвертировать в/из RUP, используем USD как промежуточную валюту
        if (fromCode === 'RUP' || toCode === 'RUP') {
            const intermediate = 'USD';
            
            // RUP -> intermediate -> target
            let rate1, rate2;
            
            if (fromCode === 'RUP') {
                rate1 = this.rates[`RUP_${intermediate}`] || this.rates[`${intermediate}_RUP`];
                if (rate1 && this.rates[`RUP_${intermediate}`] === undefined) {
                    rate1 = 1 / rate1; // Если у нас обратный курс
                }
            }
            
            if (toCode === 'RUP') {
                rate2 = this.rates[`${intermediate}_RUP`] || this.rates[`RUP_${intermediate}`];
                if (rate2 && this.rates[`${intermediate}_RUP`] === undefined) {
                    rate2 = 1 / rate2; // Если у нас обратный курс
                }
            }
            
            if (!rate1) {
                rate1 = this.rates[`${fromCode}_${intermediate}`] || (this.rates[`${intermediate}_${fromCode}`] ? 1 / this.rates[`${intermediate}_${fromCode}`] : null);
            }
            
            if (!rate2) {
                rate2 = this.rates[`${intermediate}_${toCode}`] || (this.rates[`${toCode}_${intermediate}`] ? 1 / this.rates[`${toCode}_${intermediate}`] : null);
            }
            
            if (rate1 && rate2) {
                return amount * rate1 * rate2;
            }
        }

        // Пытаемся конвертировать через USD
        const usdFromKey = `${fromCode}_USD`;
        const usdToKey = `USD_${toCode}`;
        const reverseFromKey = `USD_${fromCode}`;
        const reverseToKey = `${toCode}_USD`;
        
        let rate1 = this.rates[usdFromKey] || (this.rates[reverseFromKey] ? 1 / this.rates[reverseFromKey] : null);
        let rate2 = this.rates[usdToKey] || (this.rates[reverseToKey] ? 1 / this.rates[reverseToKey] : null);
        
        if (rate1 && rate2) {
            return amount * rate1 * rate2;
        }

        // Пытаемся через EUR
        const eurFromKey = `${fromCode}_EUR`;
        const eurToKey = `EUR_${toCode}`;
        const reverseEurFromKey = `EUR_${fromCode}`;
        const reverseEurToKey = `${toCode}_EUR`;
        
        let eurRate1 = this.rates[eurFromKey] || (this.rates[reverseEurFromKey] ? 1 / this.rates[reverseEurFromKey] : null);
        let eurRate2 = this.rates[eurToKey] || (this.rates[reverseEurToKey] ? 1 / this.rates[reverseEurToKey] : null);
        
        if (eurRate1 && eurRate2) {
            return amount * eurRate1 * eurRate2;
        }

        console.warn(`Курс для ${fromCode}/${toCode} не найден`);
        return 0;
    }

    /**
     * Получает доступные коды валют
     * @returns {string[]} массив кодов валют
     */
    getAvailableCurrencies() {
        const currencies = new Set();
        Object.keys(this.rates).forEach(key => {
            const [from, to] = key.split('_');
            currencies.add(from);
            currencies.add(to);
        });
        return Array.from(currencies).sort();
    }

    /**
     * Получает курс обмена между двумя валютами
     * @param {string} fromCode 
     * @param {string} toCode 
     * @returns {number} курс
     */
    getRate(fromCode, toCode) {
        const key = `${fromCode}_${toCode}`;
        return this.rates[key] || 0;
    }
}

// Создаем глобальный экземпляр
const currencyConverter = new CurrencyConverter();
