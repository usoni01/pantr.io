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

@app.route('/api/grocery-list', methods=['POST'])
def generate_grocery_list():
    data = request.json
    selected_recipes = data['recipes']
    servings = data['servings']

    # Generate grocery list by traversing subcategories
    grocery_list = {}
    for category, recipes_in_category in recipes.items():
        for recipe_name, ingredients in recipes_in_category.items():
            if recipe_name in selected_recipes:
                for ingredient, quantity in ingredients.items():
                    if ingredient in grocery_list:
                        grocery_list[ingredient] += quantity * servings
                    else:
                        grocery_list[ingredient] = quantity * servings

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