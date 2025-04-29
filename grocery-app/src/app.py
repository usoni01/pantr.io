from flask import Flask, jsonify, request
from flask_cors import CORS
from pantry import Pantry
from grocery_list import GroceryList
from recipes import recipes

app = Flask(__name__)
CORS(app)

pantry = Pantry()

@app.route('/api/pantry', methods=['GET'])
def get_pantry():
    return jsonify(pantry.pantry)

@app.route('/api/pantry', methods=['POST'])
def update_pantry():
    data = request.json
    pantry.pantry[data['item']] = data['quantity']
    pantry.save_pantry()
    return jsonify({"message": "Pantry updated successfully!"})

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    return jsonify(recipes)

@app.route('/api/grocery-list', methods=['POST'])
def generate_grocery_list():
    data = request.json
    selected_recipes = data['recipes']
    servings = data['servings']
    grocery_list = GroceryList.generate(selected_recipes, servings)
    needed_groceries = GroceryList.check_needed_groceries(grocery_list, pantry.pantry)
    pantry.deduct_from_pantry(grocery_list)
    pantry.save_pantry()
    return jsonify({
        "grocery_list": grocery_list,
        "needed_groceries": needed_groceries,
        "updated_pantry": pantry.pantry
    })

if __name__ == '__main__':
    app.run(debug=True)