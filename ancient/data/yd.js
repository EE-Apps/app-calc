// ==UserScript==
// @name         RuTube Downloader
// @namespace    http://tampermonkey.net/
// @version      0.4.2
// @description  Download videos from RuTube
// @author       Anonymus
// @match        *://*/*
// @updateURL    https://raw.githubusercontent.com/Enot-Enot-test/calc-ee/main/data/yd.js
// @downloadURL  https://raw.githubusercontent.com/Enot-Enot-test/calc-ee/main/data/yd.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Объект с пользовательскими текстами для ДЗ по дням и урокам
    const customHomework = {
        "Среда": {
            5: "18 правило вчити, с19правило вчити"
        }
        // Добавьте остальные дни и уроки по необходимости
    };

    function replaceHomework() {
        // Получаем все дни на странице
        const days = document.querySelectorAll(".dnevnik-day");
        days.forEach(day => {
            const dayTitle = day.querySelector(".dnevnik-day__title").innerText;
            const dayName = dayTitle.split(",")[0].trim();  // Извлекаем название дня

            // Проверяем, есть ли пользовательские тексты для этого дня
            if (customHomework[dayName]) {
                const lessons = day.querySelectorAll(".dnevnik-lesson");
                lessons.forEach((lesson, index) => {
                    const lessonNumber = index + 1;  // Номер урока начинается с 1
                    const customText = customHomework[dayName][lessonNumber];

                    // Если есть пользовательский текст для этого урока
                    if (customText) {
                        const subjectElement = lesson.querySelector(".dnevnik-lesson__subject .js-rt_licey-dnevnik-subject");
                        const subjectText = subjectElement ? subjectElement.innerText : '';

                        // Удаляем все ДЗ для того же предмета
                        const homeworkElements = lesson.querySelectorAll(".dnevnik-lesson__task");
                        homeworkElements.forEach(homeworkElement => {
                            const taskText = homeworkElement.innerText;
                            if (taskText.includes(subjectText)) {
                                homeworkElement.remove();
                            }
                        });

                        // Устанавливаем новое ДЗ
                        const newHomeworkContainer = lesson.querySelector(".dnevnik-lesson__hometask");
                        if (newHomeworkContainer) {
                            newHomeworkContainer.innerHTML = `<div class="dnevnik-lesson__task"><i class="dnevnik-lesson-icon"></i>${customText}</div>`;
                        }
                    }
                });
            }
        });
    }

    // Заменяем ДЗ при загрузке страницы
    window.addEventListener('load', replaceHomework);
})();
