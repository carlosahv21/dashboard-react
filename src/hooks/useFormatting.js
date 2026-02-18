import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
    formatDate,
    formatCurrency,
    formatRelativeTime,
    getCurrencySymbol,
    formatDateShort,
} from "../utils/formatters";

/**
 * Custom hook that provides formatting functions with the current user settings
 * This hook automatically uses the settings from AuthContext
 * 
 * @returns {Object} Formatting functions
 * 
 * @example
 * const { formatDate, formatCurrency } = useFormatting();
 * const formattedDate = formatDate("2026-02-17");
 * const formattedAmount = formatCurrency(1000);
 */
const useFormatting = () => {
    const { settings } = useContext(AuthContext);

    return {
        /**
         * Formats a date according to user's settings
         * @param {string|Date} date - Date to format
         * @param {boolean} includeTime - Whether to include time (default: false)
         * @returns {string} Formatted date
         */
        formatDate: (date, includeTime = false) => formatDate(date, settings, includeTime),

        /**
         * Formats a number as currency according to user's settings
         * @param {number} amount - Amount to format
         * @param {boolean} showSymbol - Whether to show currency symbol (default: true)
         * @returns {string} Formatted currency
         */
        formatCurrency: (amount, showSymbol = true) => formatCurrency(amount, settings, showSymbol),

        /**
         * Formats a date as relative time (e.g., "2 hours ago")
         * @param {string|Date} date - Date to format
         * @returns {string} Relative time string
         */
        formatRelativeTime: (date) => formatRelativeTime(date, settings),

        /**
         * Gets the currency symbol for the user's currency setting
         * @returns {string} Currency symbol
         */
        getCurrencySymbol: () => getCurrencySymbol(settings?.currency),

        /**
         * Formats a date in short format (e.g., "17 Feb 2026")
         * @param {string|Date} date - Date to format
         * @returns {string} Formatted short date
         */
        formatDateShort: (date) => formatDateShort(date, settings),

        /**
         * Direct access to current settings
         */
        settings,
    };
};

export default useFormatting;
