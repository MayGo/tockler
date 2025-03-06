const TEMPLATE_ID = import.meta.env.VITE_TEMPLATE_ID || '';
const SERVICE_ID = import.meta.env.VITE_SERVICE_ID || '';
const USER_ID = import.meta.env.VITE_USER_ID || '';

const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

export const sendEmail = (templateParams) => {
    const data = {
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: USER_ID,
        template_params: { ...templateParams },
    };

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    };

    return fetch(EMAILJS_API, requestOptions).then((response) => {
        if (!response.ok) {
            // For HTTP error responses (including 400), convert to JSON if possible
            // then reject with the error information
            return response.text().then((text) => {
                try {
                    const errorData = JSON.parse(text);
                    throw errorData;
                } catch {
                    // If can't parse as JSON, throw the text
                    throw new Error(text || `HTTP error ${response.status}`);
                }
            });
        }
        return response;
    });
};
