import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './theme.css';

function App() {
  const [pantry, setPantry] = useState({});
  const [recipes, setRecipes] = useState({});
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [servings, setServings] = useState(1);
  const [groceryList, setGroceryList] = useState([]);
  const [neededGroceries, setNeededGroceries] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [newPantryItem, setNewPantryItem] = useState({ item: '', quantity: '' });
  const [deliveryOption, setDeliveryOption] = useState('delivery'); // Default to delivery

  // Map main categories to images
  const categoryImages = {
    Pasta: '/assets/images/pasta.png',
    Salad: '/assets/images/salad.png',
    Sandwich: '/assets/images/sandwich.png',
    Soup: '/assets/images/soup.png',
    Dessert: '/assets/images/cake.png',
    Drinks: '/assets/images/drink.png',
    Omlette: '/assets/images/omelette.png',
  };

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/pantry').then((res) => setPantry(res.data));
    axios.get('http://127.0.0.1:5000/api/recipes').then((res) => setRecipes(res.data));
  }, []);

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

  const toggleRecipeSelection = (recipe) => {
    if (selectedRecipes.includes(recipe)) {
      setSelectedRecipes(selectedRecipes.filter((r) => r !== recipe));
    } else {
      setSelectedRecipes([...selectedRecipes, recipe]);
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
    // Simulate sending the grocery list to a store's cart
    alert(
      `Your grocery list has been sent to the cart for ${deliveryOption.toUpperCase()}!`
    );
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Pantr.io</h1>

      {/* Horizontal Category Buttons */}
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
        <div className="col-md-6 col-lg-4 mb-4">
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

        {/* Recipes Section */}
        <div className="col-md-6 col-lg-8 mb-4">
          <div className="card shadow-sm">
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
                          onClick={() => toggleRecipeSelection(recipe)}
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
        </div>
      </div>

      {/* Servings Section */}
      <div className="row">
        <div className="col-md-6 col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Servings</h2>
              <input
                type="number"
                className="form-control shadow-sm"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                min="1"
              />
              <button className="btn btn-success mt-3 w-100 shadow-sm" onClick={handleGenerateGroceryList}>
                Generate Grocery List
              </button>
            </div>
          </div>
        </div>

        {/* Grocery List Section */}
        <div className="col-md-6 col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Grocery List</h2>
              <ul className="list-group shadow-sm">
                {Object.entries(groceryList).map(([item, quantity]) => (
                  <li key={item} className="list-group-item d-flex justify-content-between align-items-center">
                    {item}
                    <span className="badge bg-success rounded-pill">{quantity}</span>
                  </li>
                ))}
              </ul>
              
            </div>
          </div>
        </div>

        {/* Needed Groceries Section */}
        <div className="col-md-6 col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Needed Groceries</h2>
              <ul className="list-group shadow-sm">
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