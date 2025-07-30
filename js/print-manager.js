import { CONFIG } from './config.js';
import { BadgeUtils } from './badge-utils.js';

export class PrintManager {
    static async printAll(people, badgeWrapper) {
        if (people.length === 0) {
            alert('No data to print.');
            return;
        }
        
        const printContainer = document.getElementById('printContainer');
        printContainer.innerHTML = '';

        const printWidthPx = CONFIG.PRINT_WIDTH_MM / 25.4 * CONFIG.DPI;
        const fontScaleFactor = printWidthPx / CONFIG.BASE_BADGE_WIDTH;

        const imageLoadPromises = [];
        const fragment = document.createDocumentFragment();

        for (const person of people) {
            const printWrapper = this.createPrintWrapper();
            const badgeClone = this.createBadgeClone(badgeWrapper);
            
            const bgImgClone = badgeClone.querySelector('.badge-img');
            const pEl = badgeClone.querySelector('#position');
            const nEl = badgeClone.querySelector('#name');
            const bEl = badgeClone.querySelector('#barcode');

            // 画像読み込みの処理
            const imgPromise = this.loadImage(person, bgImgClone);
            imageLoadPromises.push(imgPromise);

            // レイアウト適用
            const layouts = BadgeUtils.getBadgeSettings(person);
            this.applyLayout(pEl, layouts.position, fontScaleFactor);
            pEl.textContent = person.position || '';

            this.applyLayout(nEl, layouts.name, fontScaleFactor);
            nEl.textContent = person.name || '';

            this.applyLayout(bEl, layouts.barcode, fontScaleFactor);
            this.setupBarcode(bEl, person);

            [pEl, nEl, bEl].forEach(el => el.classList.remove('placeholder', 'selected'));

            printWrapper.appendChild(badgeClone);
            fragment.appendChild(printWrapper);
        }

        printContainer.appendChild(fragment);

        // フォントサイズ調整
        this.adjustPrintFontSizes(people, fontScaleFactor);

        try {
            await Promise.all(imageLoadPromises);
            window.print();
        } catch (error) {
            console.error('Error loading images for printing:', error);
            alert('Could not load all images for printing. Please check the console for errors.');
        }
    }

    static createPrintWrapper() {
        const printWrapper = document.createElement('div');
        printWrapper.style.width = `${CONFIG.PRINT_WIDTH_MM}mm`;
        printWrapper.style.height = `${CONFIG.PRINT_HEIGHT_MM}mm`;
        printWrapper.style.pageBreakInside = 'avoid';
        printWrapper.style.position = 'relative';
        printWrapper.style.overflow = 'hidden';
        return printWrapper;
    }

    static createBadgeClone(badgeWrapper) {
        const badgeClone = badgeWrapper.cloneNode(true);
        badgeClone.removeAttribute('id');
        badgeClone.style.width = '100%';
        badgeClone.style.height = '100%';
        badgeClone.style.border = '1px solid #ccc';
        badgeClone.style.boxSizing = 'border-box';
        return badgeClone;
    }

    static loadImage(person, bgImgClone) {
        return new Promise((resolve, reject) => {
            const imgSrc = person.backgroundSrc || 'test.png';
            const img = new Image();
            img.onload = resolve;
            img.onerror = () => reject(new Error(`Failed to load ${imgSrc}`));
            img.src = imgSrc;
            bgImgClone.src = imgSrc;
            if (img.complete) resolve();
        });
    }

    static applyLayout(element, layout, fontScaleFactor) {
        Object.assign(element.style, layout);
        if (layout.fontSize) {
            element.style.fontSize = (parseFloat(layout.fontSize) * fontScaleFactor) + 'px';
        }
    }

    static setupBarcode(barcodeElement, person) {
        barcodeElement.innerHTML = '';
        if (person.employeeId && person.password) {
            const svg = BadgeUtils.generateBarcode(person.employeeId, person.password);
            if (svg) {
                barcodeElement.appendChild(svg);
            }
        } else {
            barcodeElement.style.display = 'none';
        }
    }

    static adjustPrintFontSizes(people, fontScaleFactor) {
        const nameElements = document.getElementById('printContainer').querySelectorAll('#name');
        nameElements.forEach((nameEl, index) => {
            const nameText = nameEl.textContent;
            if (nameText) {
                const person = people[index];
                if (person) {
                    const savedFontSize = parseFloat(person.layouts?.name?.fontSize);
                    if (!isNaN(savedFontSize)) {
                        nameEl.style.fontSize = (savedFontSize * fontScaleFactor) + 'px';
                    } else {
                        const adjustedFontSize = BadgeUtils.measureAndAdjustFontSize(nameText, person);
                        nameEl.style.fontSize = (adjustedFontSize * fontScaleFactor) + 'px';
                    }
                    
                    // 印刷時の要素サイズで再度調整（見切れ防止）
                    let currentSize = parseFloat(nameEl.style.fontSize);
                    while (nameEl.scrollWidth > nameEl.clientWidth && currentSize > 1) {
                        currentSize--;
                        nameEl.style.fontSize = currentSize + 'px';
                    }
                }
            }
        });
    }
} 