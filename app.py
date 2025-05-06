from flask import Flask, jsonify, request
from flask_cors import CORS
from pantry import Pantry
from grocery_list import GroceryList
from recipes import recipes
from werkzeug.security import generate_password_hash, check_password_hash
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman

app = Flask(__name__)
CORS(app)

# Initialize rate limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"]
)

# Add Content Security Policy (CSP) headers
Talisman(app, content_security_policy={
    'default-src': "'self'",
    'img-src': "'self' data:",
    'script-src': "'self' 'unsafe-inline'",
    'style-src': "'self' 'unsafe-inline'"
})

pantry = Pantry()

# Update user database to store hashed passwords
users = {"testuser": generate_password_hash("C00kb00k!23")}  # Replace with a real database in production

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username in users and check_password_hash(users[username], password):
        return jsonify({"message": "Login successful", "token": "mock-token"}), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username in users:
        return jsonify({"message": "User already exists"}), 400

    # Hash the password before storing it
    users[username] = generate_password_hash(password)
    return jsonify({"message": "Signup successful"}), 201

@app.route('/api/pantry', methods=['GET'])
def get_pantry():
    return jsonify(pantry.pantry)

@app.route('/api/pantry', methods=['POST'])
def update_pantry():
    data = request.json
    pantry.pantry[data['item']] = int(data['quantity'])
    pantry.save_pantry()
    return jsonify({"message": "Pantry updated successfully!"})

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    return jsonify(recipes)

@app.route('/api/recipes/<category>', methods=['GET'])
def get_recipes_by_category(category):
    if category in recipes:
        return jsonify(recipes[category])
    else:
        return jsonify({"error": "Category not found"}), 404

@app.route('/api/recipes/<category>/<recipe_name>', methods=['GET'])
def get_recipe_details(category, recipe_name):
    """Get detailed recipe information, including ingredients and steps."""
    if category in recipes and recipe_name in recipes[category]:
        return jsonify(recipes[category][recipe_name])
    else:
        return jsonify({"error": "Recipe not found"}), 404

@app.route('/api/grocery-list', methods=['POST'])
def generate_grocery_list():
    data = request.json
    selected_recipes = data['recipes']
    servings = data['servings']

    # Generate grocery list using the updated structure
    grocery_list = GroceryList.generate(selected_recipes, servings, recipes)
    needed_groceries = GroceryList.check_needed_groceries(grocery_list, pantry.pantry)

    # Deduct used ingredients from the pantry
    pantry.deduct_from_pantry(grocery_list)
    pantry.save_pantry()

    return jsonify({
        "grocery_list": grocery_list,
        "needed_groceries": needed_groceries,
        "updated_pantry": pantry.pantry
    })

@app.errorhandler(500)
def handle_internal_error(error):
    return jsonify({"message": "An internal error occurred."}), 500

if __name__ == '__main__':
    app.run(debug=True)