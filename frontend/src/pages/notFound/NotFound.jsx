import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="notfound-container">
        <h1 className="notfound-code">404</h1>
        <p className="notfound-text">Страница не найдена</p>
        <Link to="/" className="notfound-link">Вернуться на главную</Link>
    </div>
  );
}