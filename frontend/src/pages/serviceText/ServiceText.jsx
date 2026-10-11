import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import './ServiceText.css';

import { ScrollToTop } from './ScrollTop';

export default function ServiceText() {
    const location = useLocation();
    const navigate = useNavigate();
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
                const params = new URLSearchParams({ worship, date });
                const response = await fetch(`/api/worship?${params.toString()}`);
                if (!response.ok) {
                    throw new Error('Не удалось получить текст богослужения');
                }
                const data = await response.json();
                setHtml(data.html);
            } catch (error) {
                console.error('Ошибка при загрузке богослужения:', error);
                setError('Не удалось загрузить текст богослужения');
            } finally {
                setIsLoading(false);
            }
        };
        loadWorship();
    }, [worship, date]);

    const BackButton = (
        <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
            aria-label="Назад"
        >
            {/* Стрелка-уголок влево */}
            <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <path
                    d="M15 5 L8 12 L15 19"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );

    if (isLoading) {
        return (
            <div className="service-text-container">
                {BackButton}
                <p>Загружаем текст богослужения...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="service-text-container">
                {BackButton}
                <p>{error}</p>
            </div>
        );
    }

    return (
        <>
            <ScrollToTop />
            <div className="service-text-container">
                {BackButton}

                <h1>{worship}</h1>
                <p className="service-date">{date}</p>

                <div
                    className="service-text"
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            </div>
        </>
    );
}