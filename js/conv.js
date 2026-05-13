let numOfChosing = 0;
let numOfEntering = 0;
let converters = {};
let currentConverter = 'length';

function convOpen(convName) {
    const pages = Array.from(document.getElementsByClassName('page'));
    pages.forEach(element => element.classList.remove('active'));

    document.getElementById('pconv').classList.add('active');
    localStorage.setItem('page', 'pconv');

    currentConverter = convName;
    if (!converters[currentConverter]) {
        converters[currentConverter] = [];
    }
    convUpdate();
}

function convPlaceNew() {
    if (!converters[currentConverter]) {
        converters[currentConverter] = [];
    }
    converters[currentConverter].push({ unit: "см", value: "" }); // по умолчанию "см"
    convUpdate();
}

function convValue(category, fromUnit, toUnit, value) {
    const cat = convUnitsData[category];
    if (!cat) throw new Error("Категория не найдена");

    const from = cat.find(u => u.text === fromUnit);
    const to = cat.find(u => u.text === toUnit);

    if (!from || !to) throw new Error("Единица не найдена");

    const valueInBase = value / parseFloat(from.conv);
    const result = valueInBase * parseFloat(to.conv);

    return result;
}

function convUpdate() {
    const div = document.getElementById('convplaces');
    if (!converters[currentConverter]) {
        converters[currentConverter] = [];
    }

    let html = "";
    converters[currentConverter].forEach(function(e, i) {
        let active = i === numOfChosing ? 'active' : '';
        html += `
            <div id="convN${i}" class="place ${active}">
                <button onclick="convChoseEl(${i}); document.getElementById('convN${i}').classList.add('active')">${e.unit}</button>
                <input id="convInput${i}" 
                       type="number" 
                       value="${e.value}" 
                       style="border-radius: 0 8px 8px 0; width: 75%;">
            </div>
        `;
    });

    div.innerHTML = html;

    // навешиваем слушатели
    converters[currentConverter].forEach(function(e, i) {
        const input = document.getElementById(`convInput${i}`);
        input.addEventListener("input", function() {
            convRecalculate(i, parseFloat(this.value));
            numOfEntering = i;
        });
    });
}

function convChoseEl(value) {
    numOfChosing = value;
    converters[currentConverter].forEach(function(_, i) {
        document.getElementById(`convN${i}`).classList.remove('active');
    });
}

function convSetThis(value) {
    if (!converters[currentConverter]) {
        converters[currentConverter] = [];
    }
    converters[currentConverter][numOfChosing].unit = value;
    convUpdate();
    //convRecalculate(numOfChosing, parseFloat(document.getElementById(`convInput${numOfChosing}`).value));
    convRecalculate(numOfEntering, parseFloat(document.getElementById(`convInput${numOfEntering}`).value));
}

function convRecalculate(fromIndex, fromValue) {
    if (isNaN(fromValue)) return;

    const fromUnit = converters[currentConverter][fromIndex].unit;
    converters[currentConverter][fromIndex].value = fromValue; // записываем в хранилище

    converters[currentConverter].forEach(function(obj, i) {
        if (i !== fromIndex) {
            const input = document.getElementById(`convInput${i}`);
            const val = convValue("Длина", fromUnit, obj.unit, fromValue);
            obj.value = val; // сохраняем результат
            input.value = val;
        }
    });
}

// пример использования:
console.log(convValue("Длина", "см", "м", 100)); // 1
console.log(convValue("Длина", "м", "см", 2));   // 200
console.log(convValue("Длина", "mi", "км", 1));  // ~1.609
