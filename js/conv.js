let numOfChosing = 0;
let numOfEntering = 0;
let converters = {};
let currentConverter = 'length';
let collapsedCategories = {};

// 🎨 Названия категорий для отображения
const categoryNames = {
    metric: 'Метрическая',
    imperial: 'Имперская',
    ancient: 'Старинная',
    sea: 'Морская',
    astronomic: 'Астрономическая',
    delete: 'Delete'
};

function convOpen(convName) {
    const pages = Array.from(document.getElementsByClassName('page'));
    pages.forEach(element => element.classList.remove('active'));

    document.getElementById('pconv')?.classList.add('active');
    localStorage.setItem('page', 'pconv');

    currentConverter = convName;
    if (!converters[currentConverter]) {
        converters[currentConverter] = [];
    }
    convUpdate();
}

function convCreateUnitsList() {
    const container = document.getElementById('convChoseValues');
    if (!container) return;
    container.innerHTML = '';

    const converterData = convUnitsData?.[currentConverter];
    if (!converterData || typeof converterData !== 'object') return;

    // 🔄 Загружаем сохранённое состояние сворачивания
    const collapsed = loadCollapsedState(currentConverter);

    // 1️⃣ Кнопка "удалить"
    if (converterData.delete) {
        const delDiv = document.createElement('div');
        delDiv.className = 'unitStringDelete';
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.textContent = 'Delete';
        delBtn.onclick = () => convPlaceDel(numOfChosing);
        delDiv.appendChild(delBtn);
        container.appendChild(delDiv);
    }

    // 2️⃣ Категории с единицами
    Object.entries(converterData).forEach(([categoryKey, units]) => {
        if (categoryKey === 'delete' || !Array.isArray(units)) return;

        const isCollapsed = collapsed[categoryKey] === true;
        const displayName = categoryNames[categoryKey] || categoryKey;
        const arrow = isCollapsed ? '▶' : '▼';

        // 📌 Заголовок категории (кликабельный)
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
            toggleCategory(currentConverter, categoryKey);
        };
        headerDiv.appendChild(headerBtn);
        container.appendChild(headerDiv);

        // 📦 Единицы категории (скрыты, если категория свёрнута)
        units.forEach(unit => {
            const unitDiv = document.createElement('div');
            unitDiv.className = `unitRow ${isCollapsed ? 'collapsed' : ''}`;
            
            const safeText = (unit.text || "").replace(/"/g, '&quot;');
            const safeName = (unit.name || unit.text || "").replace(/"/g, '&quot;');
            
            const unitBtn = document.createElement('button');
            unitBtn.type = 'button';
            unitBtn.className = 'unitButton';
            unitBtn.innerHTML = `
                <span class="unit-name">${safeName}</span>
                <span class="unit-text">${unit.text}</span>
                <span class="unit-value">${unit.text2 || ''}</span>
            `;
            unitBtn.onclick = () => convSetThis(safeText);
            
            unitDiv.appendChild(unitBtn);
            container.appendChild(unitDiv);
        });
    });
}

function convPlaceNew() {
    if (!converters[currentConverter]) {
        converters[currentConverter] = [];
    }
    // Берём первую доступную единицу из первой категории как дефолт
    const defaultUnit = getDefaultUnit(currentConverter);
    converters[currentConverter].push({ unit: defaultUnit, value: "" });
    convUpdate();
}

// 🆕 Вспомогательная функция: получить первую доступную единицу
function getDefaultUnit(convName) {
    const data = convUnitsData?.[convName];
    if (!data) return "см";
    
    // Ищем первую категорию с массивом единиц
    for (const [key, value] of Object.entries(data)) {
        if (key !== 'delete' && Array.isArray(value) && value.length > 0) {
            return value[0].text || "см";
        }
    }
    return "см";
}

function convPlaceDel(placeN) {
    if (!converters[currentConverter] || !Array.isArray(converters[currentConverter])) return;
    
    converters[currentConverter].splice(placeN, 1);
    
    // Корректируем индексы после удаления
    if (numOfChosing >= converters[currentConverter].length) {
        numOfChosing = Math.max(0, converters[currentConverter].length - 1);
    }
    if (numOfEntering >= converters[currentConverter].length) {
        numOfEntering = numOfChosing;
    }
    
    convUpdate();
}

// 🔍 Обновлённый поиск единицы во ВСЕХ категориях
function convValue(category, fromUnit, toUnit, value) {
    const cat = convUnitsData?.[category];
    if (!cat || typeof cat !== 'object') throw new Error("Категория не найдена");

    // Ищем в любом подмассиве категорий
    let from = null, to = null;
    
    for (const [key, units] of Object.entries(cat)) {
        if (key === 'delete' || !Array.isArray(units)) continue;
        
        if (!from) from = units.find(u => u.text === fromUnit);
        if (!to) to = units.find(u => u.text === toUnit);
        
        if (from && to) break; // нашли обе — выходим
    }

    if (!from || !to) throw new Error(`Единица не найдена: ${!from ? fromUnit : toUnit}`);
    
    const fromConv = parseFloat(from.conv);
    const toConv = parseFloat(to.conv);
    
    if (isNaN(fromConv) || isNaN(toConv) || fromConv === 0) {
        throw new Error("Некорректные коэффициенты конвертации");
    }

    const valueInBase = value / fromConv;
    return valueInBase * toConv;
}

// 🔄 Проверка: существует ли единица в текущем конвертере
function unitExists(convName, unitText) {
    const data = convUnitsData?.[convName];
    if (!data) return false;
    
    for (const [key, units] of Object.entries(data)) {
        if (key === 'delete' || !Array.isArray(units)) continue;
        if (units.some(u => u.text === unitText)) return true;
    }
    return false;
}

function convUpdate() {
    const div = document.getElementById('convplaces');
    if (!div) return;
    
    if (!converters[currentConverter]) {
        converters[currentConverter] = [];
    }

    // Генерируем HTML для полей конвертации
    let html = "";
    converters[currentConverter].forEach(function(e, i) {
        const active = i === numOfChosing ? 'active' : '';
        const safeUnit = (e.unit || "").replace(/"/g, '&quot;');
        const safeValue = e.value ?? '';
        
        html += `
            <div id="convN${i}" class="place ${active}">
                <button type="button" class="unit-btn" onclick="convChoseEl(${i})">${safeUnit}</button>
                <input id="convInput${i}" 
                       type="number" 
                       value="${safeValue}" 
                       placeholder="0">
            </div>
        `;
    });

    div.innerHTML = html;

    // Навешиваем слушатели на инпуты (без утечек)
    converters[currentConverter].forEach(function(_, i) {
        const input = document.getElementById(`convInput${i}`);
        if (input) {
            // Сбрасываем старые слушатели через клонирование
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            newInput.addEventListener("input", function() {
                const val = parseFloat(this.value);
                if (!isNaN(val)) {
                    numOfEntering = i;
                    convRecalculate(i, val);
                }
            });
        }
    });
    
    // Обновляем список единиц в модальном окне
    convCreateUnitsList();
}

function convChoseEl(index) {
    numOfChosing = index;
    
    // Обновляем визуальное выделение
    converters[currentConverter].forEach(function(_, i) {
        document.getElementById(`convN${i}`)?.classList.remove('active');
    });
    document.getElementById(`convN${index}`)?.classList.add('active');
    
    // Пересчитываем, если есть активное значение
    const activeInput = document.getElementById(`convInput${numOfEntering}`);
    if (activeInput && activeInput.value) {
        convRecalculate(numOfEntering, parseFloat(activeInput.value));
    }
}

function convSetThis(value) {
    if (!converters[currentConverter]?.[numOfChosing]) return;
    if (!unitExists(currentConverter, value)) return; // защита от несуществующих единиц
    
    converters[currentConverter][numOfChosing].unit = value;
    convUpdate();
    
    // Пересчитываем от последнего активного поля
    const input = document.getElementById(`convInput${numOfEntering}`);
    if (input && input.value !== '') {
        const val = parseFloat(input.value);
        if (!isNaN(val)) {
            convRecalculate(numOfEntering, val);
        }
    }
}

function convRecalculate(fromIndex, fromValue) {
    // Валидация параметров
    if (fromIndex === undefined || fromIndex === null) {
        fromIndex = numOfEntering;
    }
    if (isNaN(fromValue) || fromValue === undefined) {
        const input = document.getElementById(`convInput${fromIndex}`);
        if (!input || input.value === '') return;
        fromValue = parseFloat(input.value);
        if (isNaN(fromValue)) return;
    }

    if (!converters[currentConverter]?.[fromIndex]) return;

    const fromUnit = converters[currentConverter][fromIndex].unit;
    converters[currentConverter][fromIndex].value = fromValue;

    converters[currentConverter].forEach(function(obj, i) {
        if (i !== fromIndex) {
            const input = document.getElementById(`convInput${i}`);
            if (!input) return;
            
            try {
                const val = convValue(currentConverter, fromUnit, obj.unit, fromValue);
                // Форматирование: целые числа без десятичных, остальные — до 6 знаков
                const formattedVal = Number.isInteger(val) ? val : parseFloat(val.toFixed(6));
                obj.value = formattedVal;
                input.value = formattedVal;
            } catch (e) {
                console.warn('Ошибка конвертации:', e.message);
                input.value = '';
            }
        }
    });
}

// 🆕 Получить ключ для хранения состояния категории
function getCategoryStateKey(convName, categoryKey) {
    return `conv_collapsed_${convName}_${categoryKey}`;
}

// 🆕 Загрузить состояние сворачивания из localStorage
function loadCollapsedState(convName) {
    const state = {};
    const prefix = `conv_collapsed_${convName}_`;
    
    for (let key in localStorage) {
        if (key.startsWith(prefix)) {
            const categoryKey = key.replace(prefix, '');
            state[categoryKey] = localStorage.getItem(key) === 'true';
        }
    }
    return state;
}

// 🆕 Переключить состояние категории
function toggleCategory(convName, categoryKey) {
    const key = getCategoryStateKey(convName, categoryKey);
    const currentlyCollapsed = localStorage.getItem(key) === 'true';
    localStorage.setItem(key, String(!currentlyCollapsed));
    
    // Перерисовываем список с обновлённым состоянием
    convCreateUnitsList();
}

// 🚀 Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (typeof convUnitsData !== 'undefined') {
        convCreateUnitsList();
    }
});