import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <nav className="navbar">
      <h2 className="logo">🍽️ MealDB App</h2>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/meals">Meals</Link>
        <Link to="/about">About</Link>
      </div>
    </nav>
  );
}

export default Header;