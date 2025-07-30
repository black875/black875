// アプリケーション設定
export const CONFIG = {
    STORAGE_KEY: 'badge_creator_data',
    BASE_BADGE_WIDTH: 500,
    BASE_BADGE_HEIGHT: 300,
    PRINT_WIDTH_MM: 91,
    PRINT_HEIGHT_MM: 64,
    DPI: 96,
    MAX_FONT_SIZE: 60,
    MIN_FONT_SIZE: 10
};

// デフォルトの名札設定
export const DEFAULT_BADGE_SETTINGS = {
    position: {
        top: '30.22%',
        left: '5.06%',
        width: '88%',
        height: '13%',
        fontSize: '25px',
        fontFamily: "'MS Gothic', sans-serif"
    },
    name: {
        top: '44.55%',
        left: '4.93%',
        width: '88.5%',
        height: '30.5%',
        fontSize: '60px',
        fontFamily: "'MS Gothic', sans-serif"
    },
    barcode: {
        top: '73.33%',
        left: '4.8%',
        width: '47.7%',
        height: '20.4%',
        fontSize: '',
        fontFamily: ''
    }
};

// フォントオプション
export const FONT_OPTIONS = [
    { value: "'MS Gothic', sans-serif", label: "MS Gothic" },
    { value: "'MS Mincho', serif", label: "MS Mincho" },
    { value: "sans-serif", label: "Sans-Serif" },
    { value: "serif", label: "Serif" }
]; 