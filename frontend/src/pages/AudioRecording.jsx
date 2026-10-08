import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import RecordButtonImg from '../assets/mic.svg';

import './AudioRecording.css';

export default function AudioRecording() {
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fragments, setFragments] = useState([]);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const sendAudio = async (blob) => {
        setIsLoading(true);

        const formData = new FormData();

        formData.append(
            'audio',
            blob,
            'recording.webm'
        );

        try {
            const response = await fetch('/api/audio', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(
                    'Ошибка при отправке аудио'
                );
            }

            const data = await response.json();

            console.log(
                'Ответ backend:',
                data
            );

            setFragments(data.fragments);

        } catch (error) {
            console.error(
                'Не удалось отправить аудио:',
                error
            );

        } finally {
            setIsLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });

            const mediaRecorder =
                new MediaRecorder(stream);

            mediaRecorderRef.current =
                mediaRecorder;

            audioChunksRef.current = [];

            mediaRecorder.ondataavailable =
                (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(
                            event.data
                        );
                    }
                };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(
                    audioChunksRef.current,
                    {
                        type: 'audio/webm'
                    }
                );

                sendAudio(audioBlob);

                stream.getTracks().forEach(
                    track => track.stop()
                );
            };

            mediaRecorder.start();

            setIsRecording(true);
            setFragments([]);

            setTimeout(() => {
                if (
                    mediaRecorder.state === 'recording'
                ) {
                    mediaRecorder.stop();
                    setIsRecording(false);
                }
            }, 10000);

        } catch (error) {
            console.error(
                'Ошибка при записи:',
                error
            );

            alert(
                'Не удалось получить доступ к микрофону'
            );
        }
    };

    return (
        <div className="record-button-container">

            <button
                className="record-button"
                onClick={startRecording}
                disabled={
                    isRecording ||
                    isLoading
                }
            >
                <img
                    src={RecordButtonImg}
                    alt="Записать аудио"
                />
            </button>

            <p className="record-text">
                {isRecording
                    ? 'Идёт запись...'
                    : isLoading
                        ? 'Обрабатываем запись...'
                        : 'Нажмите для записи аудио'
                }
            </p>

            {isLoading && (
                <p className="loading-text">
                    Ищем отрывок...
                </p>
            )}

            {!isLoading && fragments.length > 0 && (
              <div className="fragments-container">
                  {fragments.map((fragment) => (
                      <Link
                          to="/service-text"
                          state={{
                              worship: fragment.title,
                              date: fragment.date
                          }}
                          key={fragment.id}
                      >
                          <button className="fragment-button">

                              <span className="fragment-title">
                                  {fragment.title}
                              </span>

                              <span className="fragment-text">
                                  {fragment.text}
                              </span>

                              <span className="fragment-date">
                                  {fragment.date}
                              </span>

                          </button>
                      </Link>
                  ))}
              </div>
            )}

        </div>
    );
}