import { DEFAULT_BADGE_SETTINGS, CONFIG } from './config.js';

export class BadgeUtils {
    // 名札設定を取得する関数
    static getBadgeSettings(person) {
        return person?.layouts || JSON.parse(JSON.stringify(DEFAULT_BADGE_SETTINGS));
    }
    
    // 名札設定を更新する関数
    static updateBadgeSettings(person, settings) {
        if (!person.layouts) {
            person.layouts = JSON.parse(JSON.stringify(DEFAULT_BADGE_SETTINGS));
        }
        Object.assign(person.layouts, settings);
    }
    
    // フォントサイズ調整関数
    static adjustNameFontSize(nameElement, nameText, maxFontSize = CONFIG.MAX_FONT_SIZE) {
        if (!nameElement || !nameText) return maxFontSize;
        
        nameElement.style.fontSize = maxFontSize + 'px';
        nameElement.textContent = nameText;
        
        const wasHidden = nameElement.style.display === 'none';
        if (wasHidden) nameElement.style.display = '';
        
        let currentSize = maxFontSize;
        while (nameElement.scrollWidth > nameElement.clientWidth && currentSize > CONFIG.MIN_FONT_SIZE) {
            currentSize--;
            nameElement.style.fontSize = currentSize + 'px';
        }
        
        if (wasHidden) nameElement.style.display = 'none';
        
        return currentSize;
    }
    
    // 共通のフォントサイズ測定関数
    static measureAndAdjustFontSize(nameText, person) {
        const currentSettings = this.getBadgeSettings(person);
        
        const tempElement = document.createElement('div');
        tempElement.style.position = 'absolute';
        tempElement.style.visibility = 'hidden';
        tempElement.style.fontFamily = currentSettings.name.fontFamily;
        tempElement.style.width = currentSettings.name.width;
        tempElement.style.height = currentSettings.name.height;
        tempElement.style.top = currentSettings.name.top;
        tempElement.style.left = currentSettings.name.left;
        tempElement.style.boxSizing = 'border-box';
        tempElement.style.padding = '0';
        tempElement.style.margin = '0';
        tempElement.style.border = 'none';
        tempElement.style.overflow = 'hidden';
        tempElement.style.whiteSpace = 'nowrap';
        
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.width = CONFIG.BASE_BADGE_WIDTH + 'px';
        tempContainer.style.height = CONFIG.BASE_BADGE_HEIGHT + 'px';
        tempContainer.style.aspectRatio = `${CONFIG.BASE_BADGE_WIDTH} / ${CONFIG.BASE_BADGE_HEIGHT}`;
        tempContainer.appendChild(tempElement);
        document.body.appendChild(tempContainer);
        
        const adjustedFontSize = this.adjustNameFontSize(tempElement, nameText, CONFIG.MAX_FONT_SIZE);
        document.body.removeChild(tempContainer);
        
        return adjustedFontSize;
    }
    
    // バーコード生成関数
    static generateBarcode(employeeId, password) {
        if (!employeeId || !password) return null;
        
        const data = `${employeeId}${String.fromCharCode(9)}${password}${String.fromCharCode(10)}`;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        
        JsBarcode(svg, data, {
            format: "CODE128",
            displayValue: false,
            margin: 0
        });
        
        return svg;
    }
} 