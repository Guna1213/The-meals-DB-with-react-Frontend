import "./About.css";

function About() {

  return (

    <div className="about">

      <div className="about-overlay"></div>

      <div className="about-content">

        <h1>
          About Meal App 🍔
        </h1>

        <p className="about-text">
          Welcome to the modern MealDB App built using React.
          This application allows users to discover delicious
          meals from around the world using TheMealDB API.
        </p>

        <div className="about-cards">

          <div className="about-card">

            <div className="icon">
              🔍
            </div>

            <h3>Smart Search</h3>

            <p>
              Search meals instantly by name,
              first letter, category, and area.
            </p>

          </div>

          <div className="about-card">

            <div className="icon">
              🍽️
            </div>

            <h3>Meal Details</h3>

            <p>
              View ingredients, cooking instructions,
              and recipe tutorials beautifully.
            </p>

          </div>

          <div className="about-card">

            <div className="icon">
              ✏️
            </div>

            <h3>CRUD Features</h3>

            <p>
              Add, edit, and delete your
              own custom meals easily.
            </p>

          </div>

          <div className="about-card">

            <div className="icon">
              ⚡
            </div>

            <h3>Modern UI</h3>

            <p>
              Responsive and attractive design
              with smooth animations and effects.
            </p>

          </div>

        </div>

      </div>

    </div>

  );
}

export default About;