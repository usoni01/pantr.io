from recipes import recipes

class GroceryList:
    @staticmethod
    def generate(selected_recipes, servings, recipes):
        """Generate a grocery list based on selected recipes and servings."""
        grocery_list = {}
        for category, recipes_in_category in recipes.items():
            for recipe_name, ingredients in recipes_in_category.items():
                if recipe_name in selected_recipes:
                    for ingredient, quantity in ingredients.items():
                        if ingredient in grocery_list:
                            grocery_list[ingredient] += quantity * servings
                        else:
                            grocery_list[ingredient] = quantity * servings
        return grocery_list

    @staticmethod
    def check_needed_groceries(grocery_list, pantry):
        """Check which groceries are needed based on the pantry."""
        needed_groceries = {}
        for ingredient, required_quantity in grocery_list.items():
            available_quantity = int(pantry.get(ingredient, 0))  # Convert to integer
            if required_quantity > available_quantity:
                needed_groceries[ingredient] = required_quantity - available_quantity
        return needed_groceries