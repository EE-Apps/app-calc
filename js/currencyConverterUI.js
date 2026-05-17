// ============================================================
//  currencyConverterUI.js  —  валютный конвертер
//  Архитектура полностью зеркалирует conv.js (конвертер длины)
// ============================================================

// ── 1. Данные: валюты, разбитые на категории ────────────────

const currencyUnitsData = {
    // ── Первой всегда идёт секция «выбранные» — она строится динамически ──

    postSoviet: [
        { code: 'RUP', name: 'Приднестровский рубль',  symbol: 'р.' },
        { code: 'UAH', name: 'Украинская гривна',       symbol: '₴'  },
        { code: 'RUB', name: 'Российский рубль',        symbol: '₽'  },
        { code: 'MDL', name: 'Молдавский лей',          symbol: 'L'  },
        { code: 'BYN', name: 'Белорусский рубль',       symbol: 'Br' },
        { code: 'KZT', name: 'Казахстанский тенге',     symbol: '₸'  },
        { code: 'UZS', name: 'Узбекский сум',           symbol: 'so\'m' },
        { code: 'AZN', name: 'Азербайджанский манат',   symbol: '₼'  },
        { code: 'GEL', name: 'Грузинский лари',         symbol: '₾'  },
        { code: 'AMD', name: 'Армянский драм',          symbol: '֏'  },
        { code: 'KGS', name: 'Кыргызский сом',          symbol: 'с'  },
        { code: 'TJS', name: 'Таджикский сомони',       symbol: 'SM' },
        { code: 'TMT', name: 'Туркменский манат',       symbol: 'T'  },
    ],
    europe: [
        { code: 'EUR', name: 'Евро',                    symbol: '€'  },
        { code: 'GBP', name: 'Британский фунт',         symbol: '£'  },
        { code: 'CHF', name: 'Швейцарский франк',       symbol: 'Fr' },
        { code: 'NOK', name: 'Норвежская крона',        symbol: 'kr' },
        { code: 'SEK', name: 'Шведская крона',          symbol: 'kr' },
        { code: 'DKK', name: 'Датская крона',           symbol: 'kr' },
        { code: 'PLN', name: 'Польский злотый',         symbol: 'zł' },
        { code: 'CZK', name: 'Чешская крона',           symbol: 'Kč' },
        { code: 'HUF', name: 'Венгерский форинт',       symbol: 'Ft' },
        { code: 'RON', name: 'Румынский лей',           symbol: 'lei'},
        { code: 'BGN', name: 'Болгарский лев',          symbol: 'лв' },
        { code: 'HRK', name: 'Хорватская куна',         symbol: 'kn' },
        { code: 'ISK', name: 'Исландская крона',        symbol: 'kr' },
        { code: 'TRY', name: 'Турецкая лира',           symbol: '₺'  },
    ],
    asia: [
        { code: 'JPY', name: 'Японская иена',           symbol: '¥'  },
        { code: 'CNY', name: 'Китайский юань',          symbol: '¥'  },
        { code: 'INR', name: 'Индийская рупия',         symbol: '₹'  },
        { code: 'KRW', name: 'Южнокорейская вона',      symbol: '₩'  },
        { code: 'SGD', name: 'Сингапурский доллар',     symbol: 'S$' },
        { code: 'HKD', name: 'Гонконгский доллар',      symbol: 'HK$'},
        { code: 'TWD', name: 'Тайваньский доллар',      symbol: 'NT$'},
        { code: 'THB', name: 'Тайский бат',             symbol: '฿'  },
        { code: 'MYR', name: 'Малайзийский ринггит',    symbol: 'RM' },
        { code: 'IDR', name: 'Индонезийская рупия',     symbol: 'Rp' },
        { code: 'PHP', name: 'Филиппинское песо',       symbol: '₱'  },
        { code: 'VND', name: 'Вьетнамский донг',        symbol: '₫'  },
        { code: 'AED', name: 'Дирхам ОАЭ',             symbol: 'د.إ'},
        { code: 'SAR', name: 'Саудовский риял',         symbol: '﷼'  },
        { code: 'ILS', name: 'Израильский шекель',      symbol: '₪'  },
        { code: 'PKR', name: 'Пакистанская рупия',      symbol: '₨'  },
        { code: 'BDT', name: 'Бангладешская така',      symbol: '৳'  },
    ],
    americas: [
        { code: 'USD', name: 'Доллар США',              symbol: '$'  },
        { code: 'CAD', name: 'Канадский доллар',        symbol: 'CA$'},
        { code: 'MXN', name: 'Мексиканское песо',       symbol: 'MX$'},
        { code: 'BRL', name: 'Бразильский реал',        symbol: 'R$' },
        { code: 'ARS', name: 'Аргентинское песо',       symbol: '$'  },
        { code: 'CLP', name: 'Чилийское песо',          symbol: '$'  },
        { code: 'COP', name: 'Колумбийское песо',       symbol: '$'  },
        { code: 'PEN', name: 'Перуанский соль',         symbol: 'S/' },
        { code: 'UYU', name: 'Уругвайское песо',        symbol: '$U' },
        { code: 'BOB', name: 'Боливийский боливиано',   symbol: 'Bs.'},
    ],
    africa: [
        { code: 'ZAR', name: 'Южноафриканский рэнд',   symbol: 'R'  },
        { code: 'EGP', name: 'Египетский фунт',         symbol: '£'  },
        { code: 'NGN', name: 'Нигерийская найра',       symbol: '₦'  },
        { code: 'KES', name: 'Кенийский шиллинг',       symbol: 'KSh'},
        { code: 'GHS', name: 'Ганский седи',            symbol: '₵'  },
        { code: 'MAD', name: 'Марокканский дирхам',     symbol: 'د.م.'},
        { code: 'TZS', name: 'Танзанийский шиллинг',   symbol: 'TSh'},
        { code: 'ETB', name: 'Эфиопский быр',           symbol: 'Br' },
    ],
    other: [
        { code: 'AUD', name: 'Австралийский доллар',    symbol: 'A$' },
        { code: 'NZD', name: 'Новозеландский доллар',   symbol: 'NZ$'},
    ],
};

const currencyCategoryNames = {
    postSoviet: 'Постсоветское пространство',
    europe:     'Европа',
    asia:       'Азия',
    americas:   'Америки',
    africa:     'Африка',
    other:      'Прочие',
};

// ── 2. Состояние (зеркало conv.js) ──────────────────────────

let currNumOfChosing = 0;   // какое поле «активно» (из него конвертируем)
let currNumOfEntering = 0;  // в какое поле последний раз вводили
let currencyPlaces = [];    // массив { code, value }

// ── 3. Вспомогательные функции ──────────────────────────────

function currencyFindByCode(code) {
    for (const [catKey, units] of Object.entries(currencyUnitsData)) {
        const found = units.find(u => u.code === code);
        if (found) return found;
    }
    return null;
}

function currencyDefaultCode() {
    return currencyUnitsData.postSoviet[0].code; // RUP
}

// ── 4. Конвертация ──────────────────────────────────────────

function currencyConvertValue(fromCode, toCode, value) {
    return currencyConverter.convert(value, fromCode, toCode);
}

// ── 5. Пересчёт всех полей ──────────────────────────────────

function currencyRecalculate(fromIndex, fromValue) {
    if (isNaN(fromValue) || fromValue === undefined) return;

    const fromCode = currencyPlaces[fromIndex]?.code;
    if (!fromCode) return;

    currencyPlaces[fromIndex].value = fromValue;

    currencyPlaces.forEach((place, i) => {
        if (i === fromIndex) return;
        const input = document.getElementById(`currInput${i}`);
        if (!input) return;
        try {
            const result = currencyConvertValue(fromCode, place.code, fromValue);
            const formatted = result === 0 ? '' :
                parseFloat(result.toFixed(6)).toString();
            place.value = formatted === '' ? '' : parseFloat(formatted);
            input.value = formatted;
        } catch (e) {
            input.value = '';
        }
    });
}

// ── 6. Рендер полей (places) ────────────────────────────────

function currencyUpdate() {
    const div = document.getElementById('currencyPlaces');
    if (!div) return;

    let html = '';
    currencyPlaces.forEach((place, i) => {
        const active = i === currNumOfChosing ? 'active' : '';
        const info = currencyFindByCode(place.code);
        const label = info ? `${info.code}` : place.code;
        const safeValue = place.value ?? '';

        html += `
            <div id="currN${i}" class="place ${active}">
                <button type="button" class="unit-btn" onclick="currencyChoseEl(${i})">${label}</button>
                <input id="currInput${i}" type="number" value="${safeValue}" placeholder="0">
            </div>
        `;
    });

    div.innerHTML = html;

    // Навешиваем слушатели
    currencyPlaces.forEach((_, i) => {
        const input = document.getElementById(`currInput${i}`);
        if (!input) return;
        const fresh = input.cloneNode(true);
        input.parentNode.replaceChild(fresh, input);
        fresh.addEventListener('input', function () {
            const val = parseFloat(this.value);
            if (!isNaN(val)) {
                currNumOfEntering = i;
                currencyRecalculate(i, val);
            }
        });
    });

    currencyCreateUnitsList();
}

// ── 7. Выбор активного поля ─────────────────────────────────

function currencyChoseEl(index) {
    currNumOfChosing = index;

    currencyPlaces.forEach((_, i) => {
        document.getElementById(`currN${i}`)?.classList.remove('active');
    });
    document.getElementById(`currN${index}`)?.classList.add('active');

    const activeInput = document.getElementById(`currInput${currNumOfEntering}`);
    if (activeInput && activeInput.value) {
        currencyRecalculate(currNumOfEntering, parseFloat(activeInput.value));
    }

    // Обновляем список, чтобы секция «выбранные» отражала текущее
    currencyCreateUnitsList();
}

// ── 8. Добавить / удалить поле ──────────────────────────────

function currencyPlaceNew() {
    currencyPlaces.push({ code: currencyDefaultCode(), value: '' });
    currencyUpdate();
}

function currencyPlaceDel(index) {
    currencyPlaces.splice(index, 1);
    if (currNumOfChosing >= currencyPlaces.length)
        currNumOfChosing = Math.max(0, currencyPlaces.length - 1);
    if (currNumOfEntering >= currencyPlaces.length)
        currNumOfEntering = currNumOfChosing;
    currencyUpdate();
}

// ── 9. Установить валюту для активного поля ─────────────────

function currencySetThis(code) {
    if (!currencyPlaces[currNumOfChosing]) return;
    currencyPlaces[currNumOfChosing].code = code;
    currencyUpdate();

    const input = document.getElementById(`currInput${currNumOfEntering}`);
    if (input && input.value !== '') {
        const val = parseFloat(input.value);
        if (!isNaN(val)) currencyRecalculate(currNumOfEntering, val);
    }
}

// ── 10. Список валют (правая панель) ────────────────────────

// Состояние сворачивания категорий
function currCategoryKey(catKey) {
    return `curr_collapsed_${catKey}`;
}
function currLoadCollapsed() {
    const state = {};
    for (const catKey of Object.keys(currencyUnitsData)) {
        state[catKey] = localStorage.getItem(currCategoryKey(catKey)) === 'true';
    }
    return state;
}
function currToggleCategory(catKey) {
    const key = currCategoryKey(catKey);
    const cur = localStorage.getItem(key) === 'true';
    localStorage.setItem(key, String(!cur));
    currencyCreateUnitsList();
}

function currencyCreateUnitsList() {
    const container = document.getElementById('currencyChoseValues');
    if (!container) return;
    container.innerHTML = '';

    const collapsed = currLoadCollapsed();

    // ── а) Секция «Удалить» (кнопка) ──
    const delDiv = document.createElement('div');
    delDiv.className = 'unitStringDelete';
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = 'Удалить';
    delBtn.onclick = () => currencyPlaceDel(currNumOfChosing);
    delDiv.appendChild(delBtn);
    container.appendChild(delDiv);

    // ── б) Секция «Выбранные» ──
    const selectedCodes = currencyPlaces.map(p => p.code);
    if (selectedCodes.length > 0) {
        const isCollapsed = collapsed['_selected'] === true;
        const arrow = isCollapsed ? '▶' : '▼';

        const selHeader = document.createElement('div');
        selHeader.className = 'unitCategoryHeader';
        const selBtn = document.createElement('button');
        selBtn.type = 'button';
        selBtn.innerHTML = `
            <span class="category-toggle">${arrow}</span>
            <span class="category-name">Выбранные</span>
            <span class="category-count">(${selectedCodes.length})</span>
        `;
        selBtn.onclick = (e) => {
            e.stopPropagation();
            const k = currCategoryKey('_selected');
            localStorage.setItem(k, String(!(localStorage.getItem(k) === 'true')));
            currencyCreateUnitsList();
        };
        selHeader.appendChild(selBtn);
        container.appendChild(selHeader);

        selectedCodes.forEach(code => {
            const info = currencyFindByCode(code);
            if (!info) return;
            const row = document.createElement('div');
            row.className = `unitRow ${isCollapsed ? 'collapsed' : ''}`;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'unitButton';
            btn.innerHTML = `
                <span class="unit-name">${info.name}</span>
                <span class="unit-text">${info.code}</span>
                <span class="unit-value">${info.symbol}</span>
            `;
            btn.onclick = () => currencySetThis(info.code);
            row.appendChild(btn);
            container.appendChild(row);
        });
    }

    // ── в) Географические категории ──
    for (const [catKey, units] of Object.entries(currencyUnitsData)) {
        const isCollapsed = collapsed[catKey] === true;
        const displayName = currencyCategoryNames[catKey] || catKey;
        const arrow = isCollapsed ? '▶' : '▼';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'unitCategoryHeader';
        const headerBtn = document.createElement('button');
        headerBtn.type = 'button';
        headerBtn.innerHTML = `
            <span class="category-toggle">${arrow}</span>
            <span class="category-name">${displayName}</span>
            <span class="category-count">(${units.length})</span>
        `;
        headerBtn.onclick = (e) => {
            e.stopPropagation();
            currToggleCategory(catKey);
        };
        headerDiv.appendChild(headerBtn);
        container.appendChild(headerDiv);

        units.forEach(unit => {
            const row = document.createElement('div');
            row.className = `unitRow ${isCollapsed ? 'collapsed' : ''}`;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'unitButton';
            btn.innerHTML = `
                <span class="unit-name">${unit.name}</span>
                <span class="unit-text">${unit.code}</span>
                <span class="unit-value">${unit.symbol}</span>
            `;
            btn.onclick = () => currencySetThis(unit.code);
            row.appendChild(btn);
            container.appendChild(row);
        });
    }
}

// ── 11. Инициализация ────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    currencyConverter.init().then(() => {
        // Стартовые два поля: RUP и USD
        currencyPlaces = [
            { code: 'RUP', value: '' },
            { code: 'USD', value: '' },
        ];
        currencyUpdate();
    }).catch(err => {
        console.error('Ошибка инициализации курсов:', err);
        currencyPlaces = [
            { code: 'RUP', value: '' },
            { code: 'USD', value: '' },
        ];
        currencyUpdate();
    });
});