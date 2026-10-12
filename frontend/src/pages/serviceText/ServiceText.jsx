import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ServiceText.css';

import { ScrollToTop } from './ScrollTop';

export default function ServiceText() {
    const location = useLocation();
    const navigate = useNavigate();
    const { worship, date, fragmentText, fragmentId } = location.state || {};

    const [html, setHtml] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!worship || !date) {
            setError('Не удалось определить богослужение');
            setIsLoading(false);
            return;
        }

        const loadWorship = async () => {
            try {
                const params = new URLSearchParams({ worship, date });
                const response = await fetch(
                    `/api/worship?${params.toString()}`
                );
                if (!response.ok) {
                    throw new Error('Не удалось получить текст богослужения');
                }
                const data = await response.json();
                setHtml(data.html);
            } catch (e) {
                console.error('Ошибка при загрузке богослужения:', e);
                setError('Не удалось загрузить текст богослужения');
            } finally {
                setIsLoading(false);
            }
        };

        loadWorship();
    }, [worship, date]);

    useLayoutEffect(() => {
        if (isLoading || error || !html) return;

        let cancelled = false;

        const doScroll = () => {
            if (cancelled) return;

            const root = containerRef.current?.querySelector('.service-text');
            if (!root) return;

            let el = null;

            if (fragmentId) {
                el = root.querySelector(
                    `[data-fragment-id="${fragmentId}"]`
                );
            }

            if (!el && fragmentText) {
                const normalize = (s) =>
                    s
                        .replace(/[\s\u00a0\u2009\u202f\u2007\u2008]+/g, ' ')
                        .trim();

                const needle = normalize(fragmentText).slice(0, 40);
                if (needle.length >= 10) {
                    const walker = document.createTreeWalker(
                        root,
                        NodeFilter.SHOW_TEXT
                    );
                    const nodes = [];
                    let node;
                    while ((node = walker.nextNode())) nodes.push(node);

                    let fullText = '';
                    const offsets = [];

                    for (const n of nodes) {
                        const raw = normalize(n.nodeValue);
                        if (!raw) continue;
                        if (fullText && !fullText.endsWith(' ')) fullText += ' ';
                        const start = fullText.length;
                        fullText += raw;
                        offsets.push({ start, end: fullText.length, node: n });
                    }

                    const idx = fullText.indexOf(needle);
                    if (idx !== -1) {
                        const target = offsets.find(
                            (o) => idx >= o.start && idx < o.end
                        );
                        if (target) {
                            let candidate = target.node.parentElement;
                            while (
                                candidate &&
                                candidate !== root &&
                                getComputedStyle(candidate).display === 'inline'
                            ) {
                                candidate = candidate.parentElement;
                            }
                            if (!candidate || candidate === root) {
                                candidate = target.node.parentElement;
                            }
                            el = candidate;
                        }
                    }
                }
            }

            if (!el) {
                console.warn('Фрагмент не найден', { fragmentId, fragmentText });
                return;
            }

            requestAnimationFrame(() => {
                if (cancelled) return;
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('highlighted');
                setTimeout(
                    () => el.classList.remove('highlighted'),
                    2500
                );
            });
        };

        if (document.fonts?.ready) {
            document.fonts.ready.then(() => {
                requestAnimationFrame(doScroll);
            });
        } else {
            requestAnimationFrame(doScroll);
        }

        return () => {
            cancelled = true;
        };
    }, [isLoading, error, fragmentText, fragmentId, html]);

    const BackButton = (
        <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
            aria-label="Назад"
        >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
            <div className="service-text-container" ref={containerRef}>
                {BackButton}
                <p>Загружаем текст богослужения...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="service-text-container" ref={containerRef}>
                {BackButton}
                <p>{error}</p>
            </div>
        );
    }

    return (
        <>
            <ScrollToTop />
            <div className="service-text-container" ref={containerRef}>
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