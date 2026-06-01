import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Meals.css";

const BASE = "https://www.themealdb.com/api/json/v1/1";

const CATEGORIES = [
  "Beef",
  "Breakfast",
  "Chicken",
  "Dessert",
  "Goat",
  "Lamb",
  "Miscellaneous",
  "Pasta",
  "Pork",
  "Seafood",
  "Side",
  "Starter",
  "Vegan",
  "Vegetarian",
];

const AREAS = [
  "American",
  "British",
  "Canadian",
  "Chinese",
  "Dutch",
  "Egyptian",
  "French",
  "Greek",
  "Indian",
  "Irish",
  "Italian",
  "Jamaican",
  "Japanese",
  "Malaysian",
  "Mexican",
  "Moroccan",
  "Polish",
  "Portuguese",
  "Russian",
  "Spanish",
  "Thai",
  "Turkish",
  "Vietnamese",
];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function extractIngredients(meal) {

  const list = [];

  for (let i = 1; i <= 20; i++) {

    const name = meal[`strIngredient${i}`];

    const amount = meal[`strMeasure${i}`];

    if (name && name.trim()) {

      list.push({
        name: name.trim(),
        amount: amount?.trim() || "",
        image:
          `https://www.themealdb.com/images/ingredients/
          ${encodeURIComponent(name.trim())}-Small.png`,
      });

    }
  }

  return list;
}

async function fetchFullMeal(id) {

  const res = await axios.get(
    `${BASE}/lookup.php?i=${id}`
  );

  return res.data.meals?.[0] || null;
}

function Meals() {

  /* MAIN STATES */

  const [meals, setMeals] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  /* FILTER STATES */

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedLetter, setSelectedLetter] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [selectedArea, setSelectedArea] =
    useState("");

  /* LOCAL CRUD */

  const [localMeals, setLocalMeals] =
    useState(() => {

      try {

        return JSON.parse(
          localStorage.getItem("localMeals") || "[]"
        );

      } catch {

        return [];

      }

    });

  const [showForm, setShowForm] =
    useState(false);

  const [editMeal, setEditMeal] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    image: "",
    ingredients: "",
    instructions: "",
    category: "",
    time: "",
  });

  const [formError, setFormError] =
    useState("");

  /* DETAIL MODAL */

  const [detailMeal, setDetailMeal] =
    useState(null);

  const [detailLoading, setDetailLoading] =
    useState(false);

  /* SAVE LOCAL STORAGE */

  useEffect(() => {

    localStorage.setItem(
      "localMeals",
      JSON.stringify(localMeals)
    );

  }, [localMeals]);

  /* FETCH API */

  const fetchMeals = useCallback(async () => {

    setLoading(true);

    setError(null);

    try {

      const res = await axios.get(
        `${BASE}/search.php?s=`
      );

      setMeals(res.data.meals || []);

    } catch {

      setError(
        "Failed to load meals."
      );

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    fetchMeals();

  }, [fetchMeals]);

  /* OPEN DETAIL */

  const openDetail = async (meal) => {

    if (meal._local) {

      setDetailMeal(meal);

      return;
    }

    setDetailLoading(true);

    try {

      const full =
        await fetchFullMeal(meal.idMeal);

      if (full) {

        setDetailMeal({
          ...full,
          _ingredients:
            extractIngredients(full),
        });

      }

    } finally {

      setDetailLoading(false);

    }

  };

  /* ADD MEAL */

  const openAdd = () => {

    setEditMeal(null);

    setForm({
      name: "",
      image: "",
      ingredients: "",
      instructions: "",
      category: "",
      time: "",
    });

    setShowForm(true);
  };

  /* EDIT */

  const openEdit = (meal, e) => {

    e.stopPropagation();

    setEditMeal(meal);

    setForm({
      name: meal.name || "",
      image: meal.image || "",
      ingredients:
        (meal.ingredients || [])
          .map(
            i =>
              `${i.name} - ${i.amount}`
          )
          .join("\n"),
      instructions:
        meal.instructions || "",
      category:
        meal.category || "",
      time:
        meal.time || "",
    });

    setShowForm(true);
  };

  /* DELETE */

  const handleDelete = (id, e) => {

    e.stopPropagation();

    if (
      window.confirm(
        "Delete this meal?"
      )
    ) {

      setLocalMeals(prev =>
        prev.filter(
          m => m.id !== id
        )
      );

    }

  };

  /* SAVE */

  const handleSave = () => {

    if (!form.name.trim()) {

      setFormError(
        "Meal name required"
      );

      return;
    }

    const parsedIngredients =
      form.ingredients
        ? form.ingredients
            .split("\n")
            .filter(l => l.trim())
            .map(line => {

              const [n, ...rest] =
                line.split("-");

              return {
                name: n.trim(),
                amount:
                  rest.join("-").trim(),
                image:
                  `https://www.themealdb.com/images/ingredients/
                  ${encodeURIComponent(n.trim())}-Small.png`,
              };

            })
        : [];

    const mealData = {
      name: form.name,
      image: form.image,
      ingredients:
        parsedIngredients,
      instructions:
        form.instructions,
      category:
        form.category,
      time:
        form.time,
      _local: true,
    };

    if (editMeal) {

      setLocalMeals(prev =>
        prev.map(m =>
          m.id === editMeal.id
            ? {
                ...m,
                ...mealData,
              }
            : m
        )
      );

    } else {

      setLocalMeals(prev => [
        ...prev,
        {
          id: Date.now(),
          ...mealData,
        },
      ]);

    }

    setShowForm(false);

    setEditMeal(null);

  };

  const allMeals =
    [...localMeals, ...meals];

  /* COMBINED FILTER */

  const filteredMeals =
    allMeals.filter((meal) => {

      const mealName =
        (
          meal.name ||
          meal.strMeal ||
          ""
        ).toLowerCase();

      const mealCategory =
        (
          meal.category ||
          meal.strCategory ||
          ""
        ).toLowerCase();

      const mealArea =
        (
          meal.strArea ||
          ""
        ).toLowerCase();

      const matchesSearch =
        mealName.includes(
          searchTerm.toLowerCase()
        );

      const matchesLetter =
        selectedLetter === "" ||
        mealName.startsWith(
          selectedLetter.toLowerCase()
        );

      const matchesCategory =
        selectedCategory === "" ||
        mealCategory ===
          selectedCategory.toLowerCase();

      const matchesArea =
        selectedArea === "" ||
        mealArea ===
          selectedArea.toLowerCase();

      return (
        matchesSearch &&
        matchesLetter &&
        matchesCategory &&
        matchesArea
      );

    });

  return (

    <>
    {
  detailMeal && (

    <div
      className="modal-overlay"
      onClick={() => setDetailMeal(null)}
    >

      <div
        className="detail-modal"
        onClick={(e) => e.stopPropagation()}
      >

        <button
          className="close-btn"
          onClick={() => setDetailMeal(null)}
        >
          ✖
        </button>

        <img
          src={
            detailMeal.strMealThumb ||
            detailMeal.image
          }
          alt={
            detailMeal.strMeal ||
            detailMeal.name
          }
          className="detail-image"
        />

        <h2>
          {
            detailMeal.strMeal ||
            detailMeal.name
          }
        </h2>

        <p>
          🍽️ Category :
          {
            detailMeal.strCategory ||
            detailMeal.category
          }
        </p>

        <p>
          🌍 Area :
          {
            detailMeal.strArea ||
            "Unknown"
          }
        </p>

        <p>
          ⏱️ Time :
          {
            detailMeal.time ||
            "30 mins"
          }
        </p>

        <h3>🧂 Ingredients</h3>

        <ul>

          {
            (detailMeal._ingredients ||
            detailMeal.ingredients ||
            []).map((ing, i) => (

              <li key={i}>
                {ing.name} - {ing.amount}
              </li>

            ))
          }

        </ul>

        <h3>📋 Instructions</h3>

        <p className="instructions">
          {
            detailMeal.strInstructions ||
            detailMeal.instructions
          }
        </p>

        {
          detailMeal.strYoutube && (

            <a
              href={detailMeal.strYoutube}
              target="_blank"
              rel="noreferrer"
              className="youtube-btn"
            >
              ▶ Watch Recipe Video
            </a>

          )
        }

      </div>

    </div>

  )
}

      {/* MAIN PAGE */}

      <div className="meals-page">

        <h1 className="title">
          🍽️ Meals Collection
        </h1>

        {/* FILTERS */}

        <div className="advanced-filters">

          <input
            type="text"
            placeholder="🔍 Search meals..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
          />

          <select
            value={selectedLetter}
            onChange={(e) =>
              setSelectedLetter(
                e.target.value
              )
            }
          >

            <option value="">
              All Letters
            </option>

            {
              LETTERS.map(letter => (

                <option
                  key={letter}
                  value={letter}
                >
                  {letter}
                </option>

              ))
            }

          </select>

          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(
                e.target.value
              )
            }
          >

            <option value="">
              All Categories
            </option>

            {
              CATEGORIES.map(cat => (

                <option
                  key={cat}
                  value={cat}
                >
                  {cat}
                </option>

              ))
            }

          </select>

          <select
            value={selectedArea}
            onChange={(e) =>
              setSelectedArea(
                e.target.value
              )
            }
          >

            <option value="">
              All Areas
            </option>

            {
              AREAS.map(area => (

                <option
                  key={area}
                  value={area}
                >
                  {area}
                </option>

              ))
            }

          </select>

          <button
            className="add-btn"
            onClick={openAdd}
          >
            ＋ Add Meal
          </button>

        </div>

        {/* LOADING */}

        {
          loading && (
            <h2>
              Loading...
            </h2>
          )
        }

        {/* ERROR */}

        {
          error && (
            <h2>
              {error}
            </h2>
          )
        }

        {/* MEALS */}

        <div className="meal-container">

          {
            filteredMeals.map((meal) => {

              const isLocal =
                !!meal._local;

              const id =
                meal.id ||
                meal.idMeal;

              const name =
                meal.name ||
                meal.strMeal;

              const image =
                meal.image ||
                meal.strMealThumb;

              const category =
                meal.category ||
                meal.strCategory;

              return (

                <div
                  className="meal-card"
                  key={id}
                  onClick={() =>
                    openDetail(meal)
                  }
                >

                  <div className="img-wrapper">

  <img
    src={image}
    alt={name}
    className="meal-img-clickable"
  />

  <div className="img-overlay">
    👆 Click to View
  </div>

</div>

                  <h3>
                    {name}
                  </h3>

                  {
                    category && (
                      <p>
                        🏷️ {category}
                      </p>
                    )
                  }

                  {
                    isLocal && (

                      <div
                        className="card-actions"
                        onClick={e =>
                          e.stopPropagation()
                        }
                      >

                        <button
                          className="edit-btn"
                          onClick={(e) =>
                            openEdit(
                              meal,
                              e
                            )
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={(e) =>
                            handleDelete(
                              meal.id,
                              e
                            )
                          }
                        >
                          🗑️ Delete
                        </button>

                      </div>

                    )
                  }

                </div>

              );

            })
          }

        </div>

      </div>

    </>

  );
}

export default Meals;