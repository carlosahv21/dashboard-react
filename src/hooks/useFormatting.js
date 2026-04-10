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
 * Custom hook that provides formatting functions using the current academy and user settings.
 *
 * - `academy` provides business settings: `currency`, `date_format`.
 * - `user` provides UI settings: `language`.
 * - The computed `settings` alias in AuthContext merges both, so all formatters work
 *   transparently without any call-site changes.
 *
 * @returns {Object} Formatting functions bound to the current academy/user context.
 *
 * @example
 * const { formatDate, formatCurrency } = useFormatting();
 * const formattedDate = formatDate("2026-02-17");
 * const formattedAmount = formatCurrency(1000);
 */
const useFormatting = () => {
    // `settings` is the computed alias from AuthContext that merges academy + user prefs.
    // `academy` is exposed directly for consumers that need raw academy data.
    const { settings, academy } = useContext(AuthContext);

    return {
        /**
         * Formats a date according to the academy's date_format setting.
         * @param {string|Date} date - Date to format
         * @param {boolean} includeTime - Whether to include time (default: false)
         * @returns {string} Formatted date
         */
        formatDate: (date, includeTime = false) => formatDate(date, settings, includeTime),

        /**
         * Formats a number as currency according to the academy's currency setting.
         * @param {number} amount - Amount to format
         * @param {boolean} showSymbol - Whether to show currency symbol (default: true)
         * @returns {string} Formatted currency
         */
        formatCurrency: (amount, showSymbol = true) => formatCurrency(amount, settings, showSymbol),

        /**
         * Formats a date as relative time (e.g., "2 hours ago") in the user's language.
         * @param {string|Date} date - Date to format
         * @returns {string} Relative time string
         */
        formatRelativeTime: (date) => formatRelativeTime(date, settings),

        /**
         * Gets the currency symbol for the academy's currency (e.g. "$" for USD).
         * @returns {string} Currency symbol
         */
        getCurrencySymbol: () => getCurrencySymbol(settings?.currency),

        /**
         * Formats a date in short format (e.g., "17 Feb 2026") in the user's language.
         * @param {string|Date} date - Date to format
         * @returns {string} Formatted short date
         */
        formatDateShort: (date) => formatDateShort(date, settings),

        /** Merged settings object (academy business settings + user UI preferences). */
        settings,

        /** Raw academy object from AuthContext — useful when only academy data is needed. */
        academy,
    };
};

export default useFormatting;
