import { CONFIG } from './config.js';

export class StorageManager {
    static saveToStorage(people, nextPersonId) {
        try {
            const dataToSave = {
                people: people,
                nextPersonId: nextPersonId
            };
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Failed to save data to localStorage:', error);
        }
    }

    static loadFromStorage() {
        try {
            const savedData = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (savedData) {
                const data = JSON.parse(savedData);
                return {
                    people: data.people || [],
                    nextPersonId: data.nextPersonId || 1
                };
            }
        } catch (error) {
            console.error('Failed to load data from localStorage:', error);
        }
        return { people: [], nextPersonId: 1 };
    }

    static clearStorage() {
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    }
} 