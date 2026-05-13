class CalcManager {
    constructor(parameters) {
        this.cursor = 1;
        this.system = 10;
        this.size = 'min';
    }

    init() {
    }

    interactClin(type, value = '', cursorPos) {
        if (cursorPos === undefined) {
            cursorPos = this.cursor;
        }

        // --------------------==========::::::::: система счисления :::::::::==========--------------------
        const base = this.system || 10; // система счисления
        const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, base); // допустимые символы
        const allowedChars = new RegExp(`^[${digits}]+$`, 'i');

        const input = document.getElementById('clin');
        if (!input) {
            console.error('Элемент #clin не найден!');
            return;
        }

        let currentValue = input.value;
        let pos = Math.max(0, cursorPos - 1); // переводим из твоей 1-индексации в JS-овский 0

        switch (type) {
            case 'add': {
                input.value = currentValue.slice(0, pos) + value + currentValue.slice(pos);
                if (cursorPos <= this.cursor) {
                    this.cursor += value.length;
                };
                this.interactClin('result');
                break;
            }
            case 'delFront': { // delete
                let count = Number(value) || 1;
                input.value = currentValue.slice(pos + count);
                this.interactClin('result');
                break;
            }
            case 'delBack': { // backspace удалить
                let count = Number(value) || 1;
                let start = Math.max(0, pos - count);
                input.value = currentValue.slice(0, start) + currentValue.slice(pos);
                if (this.cursor > 0) {
                    this.cursor = this.cursor - 1;
                } else {
                    this.cursor = 1;
                }
                this.interactClin('result');
                break;
            }
            case 'clear': {
                input.value = '';
                this.cursor = 1
                document.getElementById('result').textContent = ''
                break;
            }
            case 'replace': {
                input.value = value;
                document.getElementById('result').textContent = ''
                this.interactClin('result');
                break;
            }
            case 'result': {
                if (document.getElementById('clin').value.includes('x') && value === 'click') {
                    this.interactClin('add', '=')
                }
                let resultSpan = document.getElementById('result');
                let currentValue = document.getElementById('clin').value.trim();

                try {
                    // Преобразуем числа в десятичную перед вычислением
                    let convertedExpr = currentValue.replace(
                        new RegExp(`[${digits}]+`, 'gi'),
                        match => parseInt(match, base).toString(10)
                    );

                    if (convertedExpr.includes('=')) {
                        // Разделяем на строки/уравнения, если есть переносы или ;
                        let lines = convertedExpr.split(/[\n;]/).map(l => l.trim()).filter(l => l);

                        // Проверяем, система или одно уравнение
                        if (lines.length > 1) {
                            // Система уравнений
                            const variableMap = {};

                            /*// Получаем все переменные из уравнений
                            lines.forEach(eq => {
                                const varMatch = eq.match(/[a-zA-Z]+/);
                                if (varMatch) {
                                    const v = varMatch[0];
                                    if (!variableMap[v]) variableMap[v] = [];
                                    // Получаем решения для каждого уравнения по переменной
                                    const sols = nerdamer(eq).solveFor(v).map(s => s.text());
                                    variableMap[v].push(...sols);
                                }
                            });

                            // Декартово произведение всех решений
                            const cartesianProduct = (arrays) =>
                                arrays.reduce((acc, curr) => {
                                    const res = [];
                                    acc.forEach(a => curr.forEach(b => res.push(a.concat([b]))));
                                    return res;
                                }, [[]]);

                            const allSolutions = cartesianProduct(Object.values(variableMap));

                            // Выводим все комбинации
                            let output = allSolutions
                                .map(sol => Object.keys(variableMap)
                                    .map((v, i) => `${v} = ${sol[i]}`)
                                    .join('\n')
                                )
                                .join('\n\n'); // между разными решениями пустая строка*/

                            // Решаем систему через solveEquations
                            let solutions = nerdamer.solveEquations(lines);

                            // Преобразуем в массив, если это не массив
                            if (!Array.isArray(solutions)) solutions = [solutions];

                            let output = solutions
                                .map(sol => {
                                    // sol — это массив вида ['x', '23']
                                    let variable = sol[0];
                                    let value = sol[1];
                                    return `${variable} = ${nerdamer(value).evaluate().text()}`;
                                })
                                .join('\n');

                            // Переводим результат обратно в нужную систему
                            output = output.replace(/-?\d+(\.\d+)?/g, num =>
                                (isFinite(num) ? parseFloat(num).toString(base).toUpperCase() : num)
                            );

                            resultSpan.textContent = output;
                        } else {
                            // Одно уравнение
                            let solutions = nerdamer.solve(lines[0], 'x');
                            if (!Array.isArray(solutions)) solutions = [solutions];

                            let output;
                            if (solutions.length === 1) {
                                output = solutions[0];
                            } else {
                                output = solutions.map(s => `x = ${nerdamer(s).evaluate().text()}`).join('\n');

                                // Переводим результат обратно в нужную систему
                                output = output.replace(/-?\d+(\.\d+)?/g, num =>
                                    (isFinite(num) ? parseFloat(num).toString(base).toUpperCase() : num)
                                );
                            }
                            
                            resultSpan.textContent = output;
                        }
                    } else {
                        // обычный калькулятор
                        let output = nerdamer(convertedExpr).evaluate().text(); // получаем результат в виде строки

                        // Переводим результат обратно в нужную систему
                        output = output.replace(/-?\d+(\.\d+)?/g, num =>
                            (isFinite(num) ? parseFloat(num).toString(base).toUpperCase() : num)
                        );

                        resultSpan.textContent = output;
                    }

                    // Сохраняем в local storage
                    //alert(`${resultSpan.textContent} enot`);
                    localStorage.setItem('calcenter', document.getElementById('clin').value.trim());
                    localStorage.setItem('calccursor', window.CalcManager.cursor)
                } catch (e) {
                    //resultSpan.textContent = 'Ошибка: ' + e.message;
                }
                break;
            }

            default:
                console.error('Неизвестный тип взаимодействия:', type);
        }
    }

    sheetSet(system, size) {
        if (size === undefined) {
            size = this.size;
        }
        if (system === undefined) {
            system = this.system
        }
        let grid;
        this.size = size;

        localStorage.setItem('calcsize', size);
        localStorage.setItem('calcsystem', system);

        grid = document.getElementById('buttonsplace');
        grid.classList.remove('min');
        grid.classList.remove('mid');
        grid.classList.remove('max');
        grid.classList.add(size);

        grid.classList.remove(`bin`);
        grid.classList.remove(`oct`);
        grid.classList.remove(`dec`);
        grid.classList.remove(`hex`);

        if (system == 10) {
            grid.classList.add('dec');
            if (size == 'min') {
                grid.innerHTML = `
                    <button class="btn bcalc func" data-val="clear" onclick="window.CalcManager.interactClin('clear', '')">AC</button>
                    <button class="btn bcalc func" data-val="backsp" onclick="window.CalcManager.interactClin('delBack', 1)">←</button>
                    <button class="btn bcalc oper" data-val="+or-" onclick="window.CalcManager.interactClin('add', '-')">+/-</button>
                    <button class="btn bcalc oper" data-val="/" onclick="window.CalcManager.interactClin('add', '/')">/</button>
                    <button class="btn bcalc numb" data-val="7" onclick="window.CalcManager.interactClin('add', '7')">7</button>
                    <button class="btn bcalc numb" data-val="8" onclick="window.CalcManager.interactClin('add', '8')">8</button>
                    <button class="btn bcalc numb" data-val="9" onclick="window.CalcManager.interactClin('add', '9')">9</button>
                    <button class="btn bcalc oper" data-val="*" onclick="window.CalcManager.interactClin('add', '*')">*</button>
                    <button class="btn bcalc numb" data-val="4" onclick="window.CalcManager.interactClin('add', '4')">4</button>
                    <button class="btn bcalc numb" data-val="5" onclick="window.CalcManager.interactClin('add', '5')">5</button>
                    <button class="btn bcalc numb" data-val="6" onclick="window.CalcManager.interactClin('add', '6')">6</button>
                    <button class="btn bcalc oper" data-val="-" onclick="window.CalcManager.interactClin('add', '-')">-</button>
                    <button class="btn bcalc numb" data-val="1" onclick="window.CalcManager.interactClin('add', '1')">1</button>
                    <button class="btn bcalc numb" data-val="2" onclick="window.CalcManager.interactClin('add', '2')">2</button>
                    <button class="btn bcalc numb" data-val="3" onclick="window.CalcManager.interactClin('add', '3')">3</button>
                    <button class="btn bcalc oper" data-val="+" onclick="window.CalcManager.interactClin('add', '+')">+</button>
                    <button class="btn bcalc gray" data-val="more" onclick="window.CalcManager.sheetSet(undefined, 'mid')">«</button>
                    <button class="btn bcalc numb" data-val="0" onclick="window.CalcManager.interactClin('add', '0')">0</button>
                    <button class="btn bcalc numb" data-val="." onclick="window.CalcManager.interactClin('add', '.')">.</button>
                    <button class="btn bcalc func" data-val="result" onclick="window.CalcManager.interactClin('result', 'click')">=</button>`
            } else if (size == 'mid') {
                grid.innerHTML = `
                    <button class="btn bcalc oper" data-val="^" onclick="window.CalcManager.interactClin('add', '^')">^</button>
                    <button class="btn bcalc oper" data-val="%" onclick="window.CalcManager.interactClin('add', '%')">%</button>
                    <button class="btn bcalc opeb" data-val="xqrt" onclick="window.CalcManager.interactClin('add', 'xqrt(')">x√</button>
                    <button class="btn bcalc oper" data-val="(" onclick="window.CalcManager.interactClin('add', '(')">(</button>
                    <button class="btn bcalc oper" data-val=")" onclick="window.CalcManager.interactClin('add', ')')">)</button>
                    <button class="btn bcalc oper" data-val="sqrt" onclick="window.CalcManager.interactClin('add', 'sqrt(')">√</button>
                    <button class="btn bcalc func" data-val="clear" onclick="window.CalcManager.interactClin('clear', '')">AC</button>
                    <button class="btn bcalc func" data-val="backsp" onclick="window.CalcManager.interactClin('delBack', 1)">←</button>
                    <button class="btn bcalc oper" data-val="+or-" onclick="window.CalcManager.interactClin('add', '-')">+/-</button>
                    <button class="btn bcalc oper" data-val="/" onclick="window.CalcManager.interactClin('add', '/')">/</button>
                    <button class="btn bcalc oper" data-val="!" onclick="window.CalcManager.interactClin('add', '!')">x!</button>
                    <button class="btn bcalc numb" data-val="7" onclick="window.CalcManager.interactClin('add', '7')">7</button>
                    <button class="btn bcalc numb" data-val="8" onclick="window.CalcManager.interactClin('add', '8')">8</button>
                    <button class="btn bcalc numb" data-val="9" onclick="window.CalcManager.interactClin('add', '9')">9</button>
                    <button class="btn bcalc oper" data-val="*" onclick="window.CalcManager.interactClin('add', '*')">*</button>
                    <button class="btn bcalc opeb" data-val="mod" onclick="window.CalcManager.interactClin('add', 'mod')">mod</button>
                    <button class="btn bcalc numb" data-val="4" onclick="window.CalcManager.interactClin('add', '4')">4</button>
                    <button class="btn bcalc numb" data-val="5" onclick="window.CalcManager.interactClin('add', '5')">5</button>
                    <button class="btn bcalc numb" data-val="6" onclick="window.CalcManager.interactClin('add', '6')">6</button>
                    <button class="btn bcalc oper" data-val="-" onclick="window.CalcManager.interactClin('add', '-')">-</button>
                    <button class="btn bcalc oper" data-val="x" onclick="window.CalcManager.interactClin('add', 'x')">x</button>
                    <button class="btn bcalc numb" data-val="1" onclick="window.CalcManager.interactClin('add', '1')">1</button>
                    <button class="btn bcalc numb" data-val="2" onclick="window.CalcManager.interactClin('add', '2')">2</button>
                    <button class="btn bcalc numb" data-val="3" onclick="window.CalcManager.interactClin('add', '3')">3</button>
                    <button class="btn bcalc oper" data-val="+" onclick="window.CalcManager.interactClin('add', '+')">+</button>
                    <button class="btn bcalc gray" data-val="more" onclick="window.CalcManager.sheetSet(undefined, 'max')">«</button>
                    <button class="btn bcalc gray" data-val="less" onclick="window.CalcManager.sheetSet(undefined, 'min')">»</button>
                    <button class="btn bcalc numb" data-val="0" onclick="window.CalcManager.interactClin('add', '0')">0</button>
                    <button class="btn bcalc numb" data-val="." onclick="window.CalcManager.interactClin('add', '.')">.</button>
                    <button class="btn bcalc func" data-val="result" onclick="window.CalcManager.interactClin('result', 'click')">=</button>`
            } else if (size == 'max') {
                grid.innerHTML = `
                    <button class="btn bcalc opeb" data-val="sin" onclick="window.CalcManager.interactClin('add', 'sin(')">sin</button>
                    <button class="btn bcalc opeb" data-val="cos" onclick="window.CalcManager.interactClin('add', 'cos(')">cos</button>
                    <button class="btn bcalc opeb" data-val="tan" onclick="window.CalcManager.interactClin('add', 'tan(')">tan</button>
                    <button class="btn bcalc opeb" data-val="ctan" onclick="window.CalcManager.interactClin('add', 'ctan(')">ctan</button>
                    <button class="btn bcalc opeb" data-val="log" onclick="window.CalcManager.interactClin('add', 'log(')">log</button>
                    <button class="btn bcalc opeb" data-val="exp" onclick="window.CalcManager.interactClin('add', 'exp(')">exp</button>
                    <button class="btn bcalc opeb" data-val="sinh" onclick="window.CalcManager.interactClin('add', 'sinh(')">sinh</button>
                    <button class="btn bcalc opeb" data-val="cosh" onclick="window.CalcManager.interactClin('add', 'cosh(')">cosh</button>
                    <button class="btn bcalc opeb" data-val="tanh" onclick="window.CalcManager.interactClin('add', 'tanh(')">tanh</button>
                    <button class="btn bcalc opeb" data-val="ctanh" onclick="window.CalcManager.interactClin('add', 'ctanh(')">ctanh</button>
                    <button class="btn bcalc oper" data-val="(" onclick="window.CalcManager.interactClin('add', '(')">(</button>
                    <button class="btn bcalc oper" data-val=")" onclick="window.CalcManager.interactClin('add', ')')">)</button>
                    <button class="btn bcalc oper" data-val="sqrt" onclick="window.CalcManager.interactClin('add', 'sqrt(')">√</button>
                    <button class="btn bcalc oper" data-val="xqrt" onclick="window.CalcManager.interactClin('add', 'xqrt(')">x√</button>
                    <button class="btn bcalc func" data-val="clear" onclick="window.CalcManager.interactClin('clear', '')">AC</button>
                    <button class="btn bcalc func" data-val="backsp" onclick="window.CalcManager.interactClin('delBack', 1)">←</button>
                    <button class="btn bcalc oper" data-val="+or-" onclick="window.CalcManager.interactClin('add', '-')">+/-</button>
                    <button class="btn bcalc oper" data-val="/" onclick="window.CalcManager.interactClin('add', '/')">/</button>
                    <button class="btn bcalc oper" data-val="!" onclick="window.CalcManager.interactClin('add', '!')">x!</button>
                    <button class="btn bcalc oper" data-val="%" onclick="window.CalcManager.interactClin('add', '%')">%</button>
                    <button class="btn bcalc numb" data-val="7" onclick="window.CalcManager.interactClin('add', '7')">7</button>
                    <button class="btn bcalc numb" data-val="8" onclick="window.CalcManager.interactClin('add', '8')">8</button>
                    <button class="btn bcalc numb" data-val="9" onclick="window.CalcManager.interactClin('add', '9')">9</button>
                    <button class="btn bcalc oper" data-val="*" onclick="window.CalcManager.interactClin('add', '*')">*</button>
                    <button class="btn bcalc opeb" data-val="mod" onclick="window.CalcManager.interactClin('add', 'mod')">mod</button>
                    <button class="btn bcalc oper" data-val="^" onclick="window.CalcManager.interactClin('add', '^')">^</button>
                    <button class="btn bcalc numb" data-val="4" onclick="window.CalcManager.interactClin('add', '4')">4</button>
                    <button class="btn bcalc numb" data-val="5" onclick="window.CalcManager.interactClin('add', '5')">5</button>
                    <button class="btn bcalc numb" data-val="6" onclick="window.CalcManager.interactClin('add', '6')">6</button>
                    <button class="btn bcalc oper" data-val="-" onclick="window.CalcManager.interactClin('add', '-')">-</button>
                    <button class="btn bcalc oper" data-val="x" onclick="window.CalcManager.interactClin('add', 'x')">x</button>
                    <button class="btn bcalc oper" data-val="y" onclick="window.CalcManager.interactClin('add', 'y')">y</button>
                    <button class="btn bcalc numb" data-val="1" onclick="window.CalcManager.interactClin('add', '1')">1</button>
                    <button class="btn bcalc numb" data-val="2" onclick="window.CalcManager.interactClin('add', '2')">2</button>
                    <button class="btn bcalc numb" data-val="3" onclick="window.CalcManager.interactClin('add', '3')">3</button>
                    <button class="btn bcalc oper" data-val="+" onclick="window.CalcManager.interactClin('add', '+')">+</button>
                    <button class="btn bcalc gray" data-val="less" onclick="window.CalcManager.sheetSet(undefined, 'mid')">»</button>
                    <button class="btn bcalc oper" data-val="e" onclick="window.CalcManager.interactClin('add', 'e')">e</button>
                    <button class="btn bcalc oper" data-val="π" onclick="window.CalcManager.interactClin('add', 'π')">π</button>
                    <button class="btn bcalc numb" data-val="0" onclick="window.CalcManager.interactClin('add', '0')">0</button>
                    <button class="btn bcalc numb" data-val="." onclick="window.CalcManager.interactClin('add', '.')">.</button>
                    <button class="btn bcalc func" data-val="result" onclick="window.CalcManager.interactClin('result', 'click')">=</button>`
            }
        } else if (system == 16) {
            grid.classList.add('hex');
            if (size == 'min') {
                grid.innerHTML = `
                    <button class="btn bcalc numb" data-val="E" onclick="window.CalcManager.interactClin('add', 'E')">E</button>
                    <button class="btn bcalc numb" data-val="F" onclick="window.CalcManager.interactClin('add', 'F')">F</button>
                    <button class="btn bcalc oper" data-val="^" onclick="window.CalcManager.interactClin('add', '^')">^</button>
                    <button class="btn bcalc oper" data-val="(" onclick="window.CalcManager.interactClin('add', '(')">(</button>
                    <button class="btn bcalc oper" data-val=")" onclick="window.CalcManager.interactClin('add', ')')">)</button>
                    <button class="btn bcalc numb" data-val="D" onclick="window.CalcManager.interactClin('add', 'D')">D</button>
                    <button class="btn bcalc func" data-val="clear" onclick="window.CalcManager.interactClin('clear', '')">AC</button>
                    <button class="btn bcalc func" data-val="backsp" onclick="window.CalcManager.interactClin('delBack', 1)">←</button>
                    <button class="btn bcalc oper" data-val="+or-" onclick="window.CalcManager.interactClin('add', '-')">+/-</button>
                    <button class="btn bcalc oper" data-val="/" onclick="window.CalcManager.interactClin('add', '/')">/</button>
                    <button class="btn bcalc numb" data-val="C" onclick="window.CalcManager.interactClin('add', 'C')">C</button>
                    <button class="btn bcalc numb" data-val="7" onclick="window.CalcManager.interactClin('add', '7')">7</button>
                    <button class="btn bcalc numb" data-val="8" onclick="window.CalcManager.interactClin('add', '8')">8</button>
                    <button class="btn bcalc numb" data-val="9" onclick="window.CalcManager.interactClin('add', '9')">9</button>
                    <button class="btn bcalc oper" data-val="*" onclick="window.CalcManager.interactClin('add', '*')">*</button>
                    <button class="btn bcalc numb" data-val="B" onclick="window.CalcManager.interactClin('add', 'B')">B</button>
                    <button class="btn bcalc numb" data-val="4" onclick="window.CalcManager.interactClin('add', '4')">4</button>
                    <button class="btn bcalc numb" data-val="5" onclick="window.CalcManager.interactClin('add', '5')">5</button>
                    <button class="btn bcalc numb" data-val="6" onclick="window.CalcManager.interactClin('add', '6')">6</button>
                    <button class="btn bcalc oper" data-val="-" onclick="window.CalcManager.interactClin('add', '-')">-</button>
                    <button class="btn bcalc numb" data-val="A" onclick="window.CalcManager.interactClin('add', 'A')">A</button>
                    <button class="btn bcalc numb" data-val="1" onclick="window.CalcManager.interactClin('add', '1')">1</button>
                    <button class="btn bcalc numb" data-val="2" onclick="window.CalcManager.interactClin('add', '2')">2</button>
                    <button class="btn bcalc numb" data-val="3" onclick="window.CalcManager.interactClin('add', '3')">3</button>
                    <button class="btn bcalc oper" data-val="+" onclick="window.CalcManager.interactClin('add', '+')">+</button>
                    <button class="btn bcalc gray" data-val="more" onclick="window.CalcManager.sheetSet(undefined, 'mid')">«</button>
                    <button class="btn bcalc numb" data-val="∞" onclick="window.CalcManager.interactClin('add', '∞')">∞</button>
                    <button class="btn bcalc numb" data-val="0" onclick="window.CalcManager.interactClin('add', '0')">0</button>
                    <button class="btn bcalc numb" data-val="." onclick="window.CalcManager.interactClin('add', '.')">.</button>
                    <button class="btn bcalc func" data-val="result" onclick="window.CalcManager.interactClin('result', 'click')">=</button>`
            }
        }
    }

    sysSwitch(sysId) {
        let btId = 'sys';
        btId += sysId;
        document.querySelectorAll('.bsys').forEach(btn => {
            btn.classList.remove('active');
        });
        if ([2, 8, 10, 16].includes(sysId)) {
            document.getElementById(btId)?.classList.add('active');
        } else {
            document.getElementById('sysCUSTOM')?.classList.add('active');
        }
        this.system = sysId;
        this.interactClin('result');
        this.sheetSet(sysId)
    }
}

// Создаем глобальный экземпляр менеджера после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('Инициализация CalcManager...');
    window.CalcManager = new CalcManager();

    document.getElementById('clin').addEventListener(
        'change',
        window.CalcManager.interactClin.bind(window.CalcManager, 'result')
    );

    console.log('CalcManager инициализирован:', window.CalcManager);

    // Получаем textarea
    const textarea = document.getElementById('clin');

    if (textarea) {
        textarea.addEventListener('click', updateCursor);
        textarea.addEventListener('keyup', updateCursor);
        textarea.addEventListener('select', updateCursor); // на случай выделения

        function updateCursor() {
            // Позиция курсора
            window.CalcManager.cursor = textarea.selectionStart + 1;
            // Для проверки
            // console.log('Cursor at:', window.CalcManager.cursor);
        }
    }

    window.CalcManager.sheetSet(localStorage.getItem('calcsystem'), localStorage.getItem('calcsize'));
    window.CalcManager.system = localStorage.getItem('calcsystem');
    window.CalcManager.size = localStorage.getItem('calcsize');
    window.CalcManager.cursor = Number(localStorage.getItem('calccursor'));
    document.getElementById('clin').value = localStorage.getItem('calcenter');
});
