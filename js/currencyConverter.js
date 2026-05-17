class CurrencyConverterUI {
    constructor() {
        this.amountInput = null;
        this.fromSelect = null;
        this.toSelect = null;
        this.resultInput = null;
        this.rateDisplay = null;
        this.isInitialized = false;
    }

    init() {
        this.amountInput = document.getElementById('currencyAmount');
        this.fromSelect = document.getElementById('currencyFrom');
        this.toSelect = document.getElementById('currencyTo');
        this.resultInput = document.getElementById('currencyResult');
        this.rateDisplay = document.getElementById('currencyRateDisplay');

        if (!this.amountInput) {
            console.warn('Currency converter elements not found');
            return;
        }

        // Добавляем слушатели событий
        this.amountInput.addEventListener('input', () => this.updateConversion());
        this.fromSelect.addEventListener('change', () => this.updateConversion());
        this.toSelect.addEventListener('change', () => this.updateConversion());

        // Инициализируем конвертер валют
        if (!this.isInitialized) {
            this.isInitialized = true;
            currencyConverter.init().then(() => {
                this.updateConversion();
                this.updateCurrencyOptions();
            }).catch(err => {
                console.error('Error initializing currency converter:', err);
                this.rateDisplay.textContent = 'Ошибка загрузки курсов (используются статические данные)';
            });
        }
    }

    updateConversion() {
        const amount = parseFloat(this.amountInput.value) || 0;
        const fromCode = this.fromSelect.value;
        const toCode = this.toSelect.value;

        if (amount <= 0) {
            this.resultInput.value = '';
            this.rateDisplay.textContent = 'Курс: загрузка...';
            return;
        }

        const result = currencyConverter.convert(amount, fromCode, toCode);
        const rate = currencyConverter.getRate(fromCode, toCode);

        if (result > 0) {
            this.resultInput.value = result.toFixed(4);
            
            if (rate > 0) {
                this.rateDisplay.textContent = `1 ${fromCode} = ${rate.toFixed(4)} ${toCode}`;
            } else {
                this.rateDisplay.textContent = 'Курс не доступен';
            }
        } else {
            this.resultInput.value = '';
            this.rateDisplay.textContent = 'Курс не доступен';
        }
    }

    updateCurrencyOptions() {
        const available = currencyConverter.getAvailableCurrencies();
        
        // Обновляем доступные опции
        // Сохраняем текущие значения
        const currentFrom = this.fromSelect.value;
        const currentTo = this.toSelect.value;

        // Дополняем динамически загруженными валютами
        const standardCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY', 'INR', 'MDL', 'RUB', 'RUP', 'UAH'];
        const allCurrencies = [...new Set([...standardCurrencies, ...available])].sort();

        // Восстанавливаем выбранные значения
        if (available.includes(currentFrom)) {
            this.fromSelect.value = currentFrom;
        }
        if (available.includes(currentTo)) {
            this.toSelect.value = currentTo;
        }
    }
}

// Функция для обмена валют
function currencySwapValues() {
    const fromSelect = document.getElementById('currencyFrom');
    const toSelect = document.getElementById('currencyTo');
    
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;

    // Обновляем конвертацию
    const ui = window.currencyConverterUI;
    if (ui) {
        ui.updateConversion();
    }
}

// Инициализируем UI при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.currencyConverterUI = new CurrencyConverterUI();
    window.currencyConverterUI.init();
});
