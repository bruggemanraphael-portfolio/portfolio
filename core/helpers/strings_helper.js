export class StringsHelper {
    static escapeHTML(str) {
        if (str === null || str === undefined) {
            return '';
        }

        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    static sanitizeURL(value, allowedProtocols = ['http:', 'https:']) {
        if (typeof value !== 'string') {
            return '#';
        }

        const trimmed = value.trim();
        if (!trimmed) {
            return '#';
        }

        const hasExplicitScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed);
        if (!hasExplicitScheme) {
            return trimmed;
        }

        try {
            const parsed = new URL(trimmed);
            if (allowedProtocols.includes(parsed.protocol)) {
                return parsed.href;
            }
        } catch {
            return '#';
        }

        return '#';
    }
}