import { BadgeUtils } from './badge-utils.js';

export class UIManager {
    constructor() {
        this.selectedElement = null;
        this.currentEditingId = null;
        this.people = [];
        this.nextPersonId = 1;
        
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.listView = document.getElementById('listView');
        this.editView = document.getElementById('editView');
        this.personListBody = document.getElementById('personList');
        this.badgeWrapper = document.getElementById('badgeWrapper');

        this.editViewControls = {
            title: document.getElementById('editViewTitle'),
            position: document.getElementById('positionInput'),
            name: document.getElementById('nameInput'),
            employeeId: document.getElementById('employeeIdInput'),
            password: document.getElementById('passwordInput'),
            fontFamily: document.getElementById('fontFamily'),
            fontSize: document.getElementById('fontSize'),
        };

        this.preview = {
            position: document.getElementById('position'),
            name: document.getElementById('name'),
            barcode: document.getElementById('barcode'),
        };
    }

    setupEventListeners() {
        // リストビューのイベントリスナー
        this.personListBody.addEventListener('click', (e) => this.handleListClick(e));
        this.personListBody.addEventListener('input', (e) => this.handleListInput(e));

        // 編集ビューのイベントリスナー
        document.getElementById('saveAndExitBtn').addEventListener('click', () => this.saveAndExit());
        document.getElementById('cancelBtn').addEventListener('click', () => this.switchView('list'));

        // リアルタイム更新
        Object.values(this.editViewControls).forEach(control => {
            if (control.id !== 'fontFamily' && control.id !== 'fontSize') {
                control.addEventListener('input', () => this.updateEditViewPreview());
            }
        });

        this.editViewControls.fontFamily.addEventListener('change', (e) => {
            if (this.selectedElement && this.selectedElement.id !== 'barcode') {
                this.selectedElement.style.fontFamily = e.target.value;
            }
        });

        this.editViewControls.fontSize.addEventListener('input', (e) => {
            if (this.selectedElement && this.selectedElement.id !== 'barcode') {
                this.selectedElement.style.fontSize = e.target.value + 'px';
            }
        });

        // プレビュー要素のクリック
        Object.values(this.preview).forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectPreviewElement(el);
            });
        });
    }

    switchView(viewName) {
        this.listView.classList.toggle('d-none', viewName !== 'list');
        this.editView.classList.toggle('d-none', viewName !== 'edit');
    }

    renderPersonList() {
        this.personListBody.innerHTML = '';
        this.people.forEach(p => {
            const tr = document.createElement('tr');
            tr.dataset.id = p.id;
            tr.innerHTML = `
                <td><input type="text" class="form-control form-control-sm editable-input" data-field="name" value="${p.name || ''}" placeholder="Name"></td>
                <td><input type="text" class="form-control form-control-sm editable-input" data-field="position" value="${p.position || ''}" placeholder="Position"></td>
                <td><input type="text" class="form-control form-control-sm editable-input" data-field="employeeId" value="${p.employeeId || ''}" placeholder="Employee ID"></td>
                <td><input type="password" class="form-control form-control-sm editable-input" data-field="password" value="${p.password || ''}" placeholder="Password"></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-2 edit-btn" title="Edit Details"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" title="Delete"><i class="bi bi-trash"></i></button>
                </td>
            `;
            this.personListBody.appendChild(tr);
        });
    }

    handleListClick(e) {
        const target = e.target.closest('.edit-btn, .delete-btn');
        if (!target) return;
        
        const id = parseInt(target.closest('tr[data-id]').dataset.id, 10);
        if (target.matches('.edit-btn')) {
            this.loadPersonIntoEditView(id);
            this.switchView('edit');
        } else if (target.matches('.delete-btn')) {
            this.people = this.people.filter(p => p.id !== id);
            this.renderPersonList();
        }
    }

    handleListInput(e) {
        const target = e.target;
        if (!target.matches('.editable-input')) return;
        
        const id = parseInt(target.closest('tr[data-id]').dataset.id, 10);
        const field = target.dataset.field;
        const person = this.people.find(p => p.id === id);
        
        if (person) {
            person[field] = target.value;
            
            if (field === 'name') {
                const nameText = person.name || 'Name';
                const adjustedFontSize = BadgeUtils.measureAndAdjustFontSize(nameText, person);
                
                BadgeUtils.updateBadgeSettings(person, {
                    name: { ...person.layouts?.name, fontSize: adjustedFontSize + 'px' }
                });
            }
        }
    }

    loadPersonIntoEditView(id) {
        this.currentEditingId = id;
        const person = this.people.find(p => p.id === id);
        const isNew = !person;

        this.editViewControls.title.textContent = isNew ? 'Add New Person' : 'Edit Badge Details';
        this.editViewControls.position.value = person?.position || '';
        this.editViewControls.name.value = person?.name || '';
        this.editViewControls.employeeId.value = person?.employeeId || '';
        this.editViewControls.password.value = person?.password || '';

        const layouts = BadgeUtils.getBadgeSettings(person);

        // テキストを設定
        this.preview.position.textContent = person?.position || 'Position';
        this.preview.name.textContent = person?.name || 'Name';
        this.preview.position.classList.toggle('placeholder', !person?.position);
        this.preview.name.classList.toggle('placeholder', !person?.name);

        // レイアウトを適用
        Object.keys(this.preview).forEach(key => {
            Object.assign(this.preview[key].style, layouts[key]);
        });

        const nameLayout = layouts.name;
        const fontFamilyValue = nameLayout.fontFamily || "'MS Gothic', sans-serif";
        this.editViewControls.fontFamily.value = fontFamilyValue;
        
        const fontSizeValue = parseFloat(nameLayout.fontSize) || 60;
        this.editViewControls.fontSize.value = fontSizeValue;

        // フォントサイズ調整
        const nameText = person?.name || 'Name';
        const adjustedFontSize = BadgeUtils.measureAndAdjustFontSize(nameText, person);
        this.preview.name.style.fontSize = adjustedFontSize + 'px';
        this.editViewControls.fontSize.value = adjustedFontSize;

        // バーコード処理
        this.updateBarcodePreview(person);

        this.selectPreviewElement(this.preview.position);
    }

    updateEditViewPreview() {
        const posText = this.editViewControls.position.value;
        const nameText = this.editViewControls.name.value;
        
        this.preview.position.textContent = posText || 'Position';
        this.preview.name.textContent = nameText || 'Name';
        this.preview.position.classList.toggle('placeholder', !posText);
        this.preview.name.classList.toggle('placeholder', !nameText);

        // フォントサイズ調整
        const currentPerson = this.people.find(p => p.id === this.currentEditingId);
        const adjustedFontSize = BadgeUtils.measureAndAdjustFontSize(nameText || 'Name', currentPerson);
        this.preview.name.style.fontSize = adjustedFontSize + 'px';

        // バーコード更新
        this.updateBarcodePreview({
            employeeId: this.editViewControls.employeeId.value,
            password: this.editViewControls.password.value
        });
    }

    updateBarcodePreview(person) {
        this.preview.barcode.innerHTML = '';
        if (person?.employeeId && person?.password) {
            const svg = BadgeUtils.generateBarcode(person.employeeId, person.password);
            if (svg) {
                this.preview.barcode.appendChild(svg);
            }
        } else {
            this.preview.barcode.classList.add('placeholder');
            this.preview.barcode.textContent = 'Barcode';
        }
    }

    saveAndExit() {
        const id = this.currentEditingId || this.nextPersonId;
        let person = this.people.find(p => p.id === id);

        if (!person) {
            person = { id };
            this.people.push(person);
            if (!this.currentEditingId) this.nextPersonId++;
        }

        person.name = this.editViewControls.name.value;
        person.position = this.editViewControls.position.value;
        person.employeeId = this.editViewControls.employeeId.value;
        person.password = this.editViewControls.password.value;

        // 現在のプレビューの設定を保存
        const currentSettings = {};
        Object.keys(this.preview).forEach(key => {
            const style = this.preview[key].style;
            currentSettings[key] = {
                top: style.top,
                left: style.left,
                width: style.width,
                height: style.height,
                fontSize: style.fontSize,
                fontFamily: style.fontFamily,
            };
        });
        BadgeUtils.updateBadgeSettings(person, currentSettings);

        this.renderPersonList();
        this.switchView('list');
    }

    selectPreviewElement(el) {
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
        }
        this.selectedElement = el;
        if (this.selectedElement) {
            this.selectedElement.classList.add('selected');
            if (this.selectedElement.id !== 'barcode') {
                this.editViewControls.fontFamily.value = this.selectedElement.style.fontFamily;
                this.editViewControls.fontSize.value = parseFloat(this.selectedElement.style.fontSize);
            }
        }
    }

    // データ設定メソッド
    setData(people, nextPersonId) {
        this.people = people;
        this.nextPersonId = nextPersonId;
    }

    getData() {
        return { people: this.people, nextPersonId: this.nextPersonId };
    }

    getBadgeWrapper() {
        return this.badgeWrapper;
    }
} 