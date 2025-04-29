import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './theme.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [pantry, setPantry] = useState({});
  const [recipes, setRecipes] = useState({});
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [servings, setServings] = useState(1);
  const [groceryList, setGroceryList] = useState([]);
  const [neededGroceries, setNeededGroceries] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [newPantryItem, setNewPantryItem] = useState({ item: '', quantity: '' });
  const [deliveryOption, setDeliveryOption] = useState('delivery');
  const [recipeSteps, setRecipeSteps] = useState([]);
  const [recipeIngredients, setRecipeIngredients] = useState({}); // New state for ingredients

  const categoryImages = {
    Pasta: '/assets/images/pasta.png',
    Salad: '/assets/images/salad.png',
    Sandwich: '/assets/images/sandwich.png',
    Soup: '/assets/images/soup.png',
    Desserts: '/assets/images/cake.png',
    Drinks: '/assets/images/drink.png',
    Omelette: '/assets/images/omelette.png',
  };

  useEffect(() => {
    if (isLoggedIn) {
      axios.get('http://127.0.0.1:5000/api/pantry').then((res) => setPantry(res.data));
      axios.get('http://127.0.0.1:5000/api/recipes').then((res) => setRecipes(res.data));
    }
  }, [isLoggedIn]);

  const handleGenerateGroceryList = () => {
    axios
      .post('http://127.0.0.1:5000/api/grocery-list', {
        recipes: selectedRecipes,
        servings: servings,
      })
      .then((res) => {
        setGroceryList(res.data.grocery_list);
        setNeededGroceries(res.data.needed_groceries);
        setPantry(res.data.updated_pantry);
      });
  };

  const toggleRecipeSelection = (recipe, category) => {
    if (selectedRecipes.includes(recipe)) {
      setSelectedRecipes(selectedRecipes.filter((r) => r !== recipe));
      setRecipeSteps([]);
      setRecipeIngredients({});
    } else {
      setSelectedRecipes([...selectedRecipes, recipe]);
      fetchRecipeDetails(recipe, category);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handlePantryUpdate = (e) => {
    e.preventDefault();
    if (newPantryItem.item && newPantryItem.quantity) {
      axios
        .post('http://127.0.0.1:5000/api/pantry', newPantryItem)
        .then(() => {
          setPantry({ ...pantry, [newPantryItem.item]: Number(newPantryItem.quantity) });
          setNewPantryItem({ item: '', quantity: '' });
        })
        .catch((err) => console.error('Error updating pantry:', err));
    }
  };

  const handleSendToCart = () => {
    alert(
      `Your grocery list has been sent to the cart for ${deliveryOption.toUpperCase()}!`
    );
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthToken(null);
  };

  const fetchRecipeDetails = (recipeName, category) => {
    axios
      .get(`http://127.0.0.1:5000/api/recipes/${category}/${recipeName}`)
      .then((res) => {
        setRecipeSteps(res.data.steps);
        setRecipeIngredients(res.data.ingredients); // Set ingredients for the selected recipe
      })
      .catch((err) => console.error('Error fetching recipe details:', err));
  };

  const LoginForm = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
      e.preventDefault();
      axios
        .post('http://127.0.0.1:5000/login', { username, password })
        .then((res) => {
          onLogin(res.data.token);
        })
        .catch(() => {
          setError('Invalid username or password');
        });
    };

    return (
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-danger">{error}</p>}
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    );
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={(token) => { setIsLoggedIn(true); setAuthToken(token); }} />;
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Pantr.io</h1>
      <button className="btn btn-danger mb-3" onClick={handleLogout}>
        Logout
      </button>

      <div className="d-flex justify-content-center mb-4">
        {Object.keys(categoryImages).map((category) => (
          <div
            key={category}
            className={`category-button me-3 ${expandedCategory === category ? 'active' : ''}`}
            onClick={() => toggleCategory(category)}
            style={{
              cursor: 'pointer',
              borderRadius: '50%',
              overflow: 'hidden',
              width: '80px',
              height: '80px',
              border: expandedCategory === category ? '3px solid #007bff' : '3px solid transparent',
            }}
          >
            <img
              src={categoryImages[category]}
              alt={category}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>

      <div className="row">
        {/* Pantry Section */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Pantry</h2>
              <div className="d-flex flex-wrap mb-3">
                {Object.entries(pantry).map(([item, quantity]) => (
                  <div key={item} className="pantry-item d-flex align-items-center mb-2 me-2">
                    <span className="chip">
                      {item} <span className="badge bg-primary">{quantity}</span>
                    </span>
                  </div>
                ))}
              </div>
              <form onSubmit={handlePantryUpdate}>
                <div className="mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Item name"
                    value={newPantryItem.item}
                    onChange={(e) => setNewPantryItem({ ...newPantryItem, item: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Quantity"
                    value={newPantryItem.quantity}
                    onChange={(e) => setNewPantryItem({ ...newPantryItem, quantity: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Add/Update Pantry
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Recipes and Recipe Details */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h2 className="card-title">Recipes</h2>
              {expandedCategory && (
                <div className="mt-2">
                  <div className="d-flex flex-wrap">
                    {Object.keys(recipes[expandedCategory]).map((recipe) => (
                      <div key={recipe} className="recipe-card me-2 mb-2">
                        <button
                          className={`btn btn-outline-success ${
                            selectedRecipes.includes(recipe) ? 'active' : ''
                          }`}
                          onClick={() => toggleRecipeSelection(recipe, expandedCategory)}
                        >
                          {recipe}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {Object.keys(recipeIngredients).length > 0 && (
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h2 className="card-title">Ingredients</h2>
                <ul>
                  {Object.entries(recipeIngredients).map(([ingredient, quantity]) => (
                    <li key={ingredient}>
                      {ingredient}: {quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {recipeSteps.length > 0 && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="card-title">Recipe Steps</h2>
                <ol>
                  {recipeSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Grocery Section */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h2 className="card-title">Grocery List</h2>
              <input
                type="number"
                className="form-control mb-2"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                min="1"
              />
              <button className="btn btn-success mb-3 w-100" onClick={handleGenerateGroceryList}>
                Generate Grocery List
              </button>
              
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Needed Groceries</h2>
              <ul className="list-group">
                {Object.entries(neededGroceries).map(([item, quantity]) => (
                  <li key={item} className="list-group-item d-flex justify-content-between align-items-center">
                    {item}
                    <span className="badge bg-danger rounded-pill">{quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <h5>Choose Delivery Option:</h5>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="deliveryOption"
                    id="delivery"
                    value="delivery"
                    checked={deliveryOption === 'delivery'}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="delivery">
                    Delivery
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="deliveryOption"
                    id="pickup"
                    value="pickup"
                    checked={deliveryOption === 'pickup'}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="pickup">
                    Pickup
                  </label>
                </div>
              </div>
              <button className="btn btn-primary mt-3 w-100" onClick={handleSendToCart}>
                Send to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;