/**
 * API Service Wrapper
 * Gestisce centralmente le chiamate fetch, l'autenticazione e il reindirizzamento.
 */



/**
 * Funzione core del wrapper
 */
async function fetchWrapper(endpoint, { method = 'GET', body = null, ...customOptions } = {}) {
    const token = localStorage.getItem('token');

    // Configurazione Header predefiniti
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...customOptions.headers,
    };

    const config = {
        method,
        headers,
        ...customOptions,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(endpoint, config);

        // --- INTERCETTORE RISPOSTA ---

        // 1. Gestione Autenticazione Fallita (401)
        if (response.status === 401) {
            localStorage.removeItem('token');
            // Forza il reindirizzamento alla pagina di login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login?expired=true';
            }
            return null;
        }

        // 2. Gestione errori di business (400, 403, 404, 500)
        if (!response.ok) {
            const errorData = await response.json();
            const error = new Error(errorData.detail || 'Errore nella richiesta API');
            error.message = errorData.message
            error.status = errorData.status;
            throw error;
        }

        // 3. Ritorna il JSON per risposte 200-299 (se presenti dati)
        if (response.status === 204) return null; // No content
        return await response.json();

    } catch (err) {
        console.error(`[API ERROR] ${method} ${endpoint}:`, err.message, err);
        //window.location.href = '/error'
    }
}

/**
 * Esportazione dei metodi HTTP per un utilizzo più pulito
 */
export const api = {
    get: (url, options) => fetchWrapper(url, { ...options, method: 'GET' }),
    post: (url, body, options) => fetchWrapper(url, { ...options, method: 'POST', body }),
    put: (url, body, options) => fetchWrapper(url, { ...options, method: 'PUT', body }),
    delete: (url, options) => fetchWrapper(url, { ...options, method: 'DELETE' }),
};