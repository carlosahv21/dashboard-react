import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import "dayjs/locale/en";

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

/**
 * Maps backend date_format strings to display formats
 * The backend sends formats like "YYYY-MM-DD", but we need to support various display formats
 */
const DATE_FORMAT_MAP = {
    "YYYY-MM-DD": "YYYY-MM-DD",
    "DD/MM/YYYY": "DD/MM/YYYY",
    "MM/DD/YYYY": "MM/DD/YYYY",
    "DD-MM-YYYY": "DD-MM-YYYY",
    "MM-DD-YYYY": "MM-DD-YYYY",
};

/**
 * Currency symbol mapping
 */
const CURRENCY_SYMBOLS = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CNY: "¥",
    CAD: "$",
    AUD: "$",
    MXN: "$",
    BRL: "R$",
    INR: "₹",
    RUB: "₽",
    KRW: "₩",
    CHF: "CHF",
    VES: "Bs",
};

/**
 * Gets the currency symbol for a given currency code
 * @param {string} currency - Currency code (e.g., "USD", "EUR")
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency) => {
    if (!currency) return "$"; // Default to USD
    return CURRENCY_SYMBOLS[currency.toUpperCase()] || currency;
};

/**
 * Formats a date according to the user's date_format setting
 * @param {string|Date|dayjs.Dayjs} date - Date to format
 * @param {Object} settings - User settings object from AuthContext
 * @param {boolean} includeTime - Whether to include time in the format (default: false)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, settings, includeTime = false) => {
    if (!date) return "-";

    try {
        const dayjsDate = dayjs(date);
        if (!dayjsDate.isValid()) return "-";

        // Get the format from settings, default to DD/MM/YYYY
        const baseFormat = settings?.date_format
            ? (DATE_FORMAT_MAP[settings.date_format] || settings.date_format)
            : "DD/MM/YYYY";

        // Add time if requested
        const format = includeTime ? `${baseFormat} HH:mm` : baseFormat;

        return dayjsDate.format(format);
    } catch (error) {
        console.error("Error formatting date:", error);
        return "-";
    }
};

/**
 * Formats a date as relative time (e.g., "2 hours ago", "hace 2 horas")
 * @param {string|Date|dayjs.Dayjs} date - Date to format
 * @param {Object} settings - User settings object from AuthContext
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date, settings) => {
    if (!date) return "-";

    try {
        const locale = settings?.language || "es";
        dayjs.locale(locale);

        const dayjsDate = dayjs(date);
        if (!dayjsDate.isValid()) return "-";

        return dayjsDate.fromNow();
    } catch (error) {
        console.error("Error formatting relative time:", error);
        return "-";
    }
};

/**
 * Formats a number as currency based on the user's currency and language settings
 * @param {number} amount - Amount to format
 * @param {Object} settings - User settings object from AuthContext
 * @param {boolean} showSymbol - Whether to show currency symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, settings, showSymbol = true) => {
    if (amount === null || amount === undefined) return "-";

    try {
        const currency = settings?.currency || "USD";
        const language = settings?.language || "es";

        // Map language to locale for Intl.NumberFormat
        const localeMap = {
            es: "es-ES",
            en: "en-US",
        };
        const locale = localeMap[language] || "es-ES";

        // Format the number with currency
        const formatted = new Intl.NumberFormat(locale, {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);

        // If showSymbol is false, remove the currency symbol and return just the number
        if (!showSymbol) {
            return formatted.replace(/[^\d.,\-]/g, "").trim();
        }

        return formatted;
    } catch (error) {
        console.error("Error formatting currency:", error);
        // Fallback to simple format
        const symbol = getCurrencySymbol(settings?.currency);
        return `${symbol}${Number(amount).toFixed(0)}`;
    }
};

/**
 * Formats a date for display in a short format (e.g., "DD MMM YYYY")
 * Useful for compact displays like "17 Feb 2026"
 * @param {string|Date|dayjs.Dayjs} date - Date to format
 * @param {Object} settings - User settings object from AuthContext
 * @returns {string} Formatted date string
 */
export const formatDateShort = (date, settings) => {
    if (!date) return "-";

    try {
        const locale = settings?.language || "es";
        dayjs.locale(locale);

        const dayjsDate = dayjs(date);
        if (!dayjsDate.isValid()) return "-";

        return dayjsDate.format("DD MMM YYYY");
    } catch (error) {
        console.error("Error formatting short date:", error);
        return "-";
    }
};
