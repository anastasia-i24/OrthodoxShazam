import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import './ServiceText.css';

export default function ServiceText() {
    const location = useLocation();
    const { worship, date } = location.state || {};
    const [html, setHtml] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!worship || !date) {
            setError('Не удалось определить богослужение');
            setIsLoading(false);
            return;
        }

        const loadWorship = async () => {
            try {
                const params = new URLSearchParams({
                    worship: worship,
                    date: date
                });
                const response = await fetch(
                    `/api/worship?${params.toString()}`
                );
                if (!response.ok) {
                    throw new Error(
                        'Не удалось получить текст богослужения'
                    );
                }
                const data = await response.json();
                setHtml(data.html);
            } catch (error) {
                console.error(
                    'Ошибка при загрузке богослужения:',
                    error
                );
                setError(
                    'Не удалось загрузить текст богослужения'
                );
            } finally {
                setIsLoading(false);
            }
        };
        loadWorship();
    }, [worship, date]);

    if (isLoading) {
        return (
            <div className="service-text-container">
                <p>Загружаем текст богослужения...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="service-text-container">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="service-text-container">

            <h1>{worship}</h1>

            <p className="service-date">
                {date}
            </p>

            <div
                className="service-text"
                dangerouslySetInnerHTML={{
                    __html: html
                }}
            />

        </div>
    );
}