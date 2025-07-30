import { StorageManager } from './storage.js';
import { CSVHandler } from './csv-handler.js';
import { PrintManager } from './print-manager.js';
import { UIManager } from './ui-manager.js';
import { DragDropManager } from './drag-drop-manager.js';
import { DEFAULT_BADGE_SETTINGS } from './config.js';

export class BadgeCreatorApp {
    constructor() {
        this.uiManager = new UIManager();
        this.dragDropManager = new DragDropManager(this.uiManager.getBadgeWrapper());
        
        this.initializeApp();
        this.setupGlobalEventListeners();
    }

    initializeApp() {
        // 保存されたデータを読み込む
        const { people, nextPersonId } = StorageManager.loadFromStorage();
        this.uiManager.setData(people, nextPersonId);
        
        if (people.length > 0) {
            console.log(`${people.length}件のデータを読み込みました。`);
        }
        
        this.uiManager.renderPersonList();
        this.uiManager.switchView('list');
    }

    setupGlobalEventListeners() {
        // 新しい人物を追加
        document.getElementById('addPersonBtn').addEventListener('click', () => {
            this.addNewPerson();
        });

        // CSVエクスポート
        document.getElementById('exportCsvBtn').addEventListener('click', () => {
            const { people } = this.uiManager.getData();
            CSVHandler.exportToCsv(people);
        });

        // CSVインポート
        document.getElementById('importCsvInput').addEventListener('change', (e) => {
            CSVHandler.importFromCsv(e.target.files[0], (importedPeople, nextId) => {
                this.uiManager.setData(importedPeople, nextId);
                this.uiManager.renderPersonList();
                this.saveData();
            });
        });

        // 印刷
        document.getElementById('printAllBtn').addEventListener('click', () => {
            const { people } = this.uiManager.getData();
            PrintManager.printAll(people, this.uiManager.getBadgeWrapper());
        });

        // データクリア
        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.clearData();
        });

        // リストビューの入力変更時に自動保存
        this.uiManager.personListBody.addEventListener('input', () => {
            this.saveData();
        });

        // 編集ビューの保存時に自動保存
        const originalSaveAndExit = this.uiManager.saveAndExit.bind(this.uiManager);
        this.uiManager.saveAndExit = () => {
            originalSaveAndExit();
            this.saveData();
        };
    }

    addNewPerson() {
        const { people, nextPersonId } = this.uiManager.getData();
        const newId = nextPersonId;
        const newPerson = {
            id: newId,
            name: '', 
            position: '', 
            employeeId: '', 
            password: '',
            layouts: JSON.parse(JSON.stringify(DEFAULT_BADGE_SETTINGS))
        };
        
        people.push(newPerson);
        this.uiManager.setData(people, nextPersonId + 1);
        this.uiManager.renderPersonList();
        this.saveData();
    }

    clearData() {
        if (StorageManager.clearStorage()) {
            if (window.confirm('clear data?')) {
                this.uiManager.setData([], 1);
                this.uiManager.renderPersonList();
            }
        } else {
            alert('failed to clear data');
        }
    }

    saveData() {
        const { people, nextPersonId } = this.uiManager.getData();
        StorageManager.saveToStorage(people, nextPersonId);
    }
} 