from pantry import Pantry
from recipes import recipes
from grocery_list import GroceryList
from utils import format_quantity
import requests

def login():
    print("Please log in to continue.")
    while True:
        username = input("Username: ").strip()
        password = input("Password: ").strip()
        response = requests.post("http://127.0.0.1:5000/login", json={"username": username, "password": password})
        if response.status_code == 200:
            print("Login successful!")
            return response.json()["token"]
        else:
            print("Invalid credentials. Please try again.")

def main():
    print("Welcome to the Grocery List Generator!")
    token = login()  # Authenticate the user before proceeding
    pantry = Pantry()

    # Allow the user to update the pantry before proceeding
    update_choice = input("Would you like to update your pantry before starting? (yes/no): ").strip().lower()
    if update_choice == "yes":
        pantry.update_pantry()
        pantry.save_pantry()

    # Select recipes
    selected = []
    while True:
        print("\nAvailable recipes:")
        for idx, (category, recipes_in_category) in enumerate(recipes.items(), 1):
            print(f"{idx}. {category}")
        category_choice = input("Select a category by number (or 'done' to finish): ").strip()
        if category_choice.lower() == "done":
            break
        try:
            category_idx = int(category_choice) - 1
            category_name = list(recipes.keys())[category_idx]
            print(f"\nRecipes in {category_name}:")
            for idx, recipe_name in enumerate(recipes[category_name].keys(), 1):
                print(f"{idx}. {recipe_name}")
            recipe_choice = input("Select a recipe by number (or 'back' to go back): ").strip()
            if recipe_choice.lower() == "back":
                continue
            recipe_idx = int(recipe_choice) - 1
            recipe_name = list(recipes[category_name].keys())[recipe_idx]
            if recipe_name not in selected:
                selected.append(recipe_name)
                print(f"Added '{recipe_name}' to your selection.")
            else:
                print(f"'{recipe_name}' is already selected.")
        except (ValueError, IndexError):
            print("Invalid selection, try again.")

    if not selected:
        print("No recipes selected.")
        return

    # Ask the user how many people the food is for
    while True:
        try:
            servings = int(input("How many people is this food for? "))
            if servings <= 0:
                print("Please enter a positive number.")
                continue
            break
        except ValueError:
            print("Invalid input. Please enter a number.")

    # Generate the grocery list
    grocery_list = GroceryList.generate(selected, servings, recipes)

    # Check what groceries are needed to be bought
    needed_groceries = GroceryList.check_needed_groceries(grocery_list, pantry.pantry)

    # Display the full grocery list
    print("\nYour grocery list:")
    for item, quantity in grocery_list.items():
        print(f"- {item}: {format_quantity(quantity, item)}")

    # Display the groceries that need to be bought
    print("\nGroceries needed to be bought:")
    if needed_groceries:
        for item, quantity in needed_groceries.items():
            print(f"- {item}: {format_quantity(quantity, item)}")
    else:
        print("You have all the ingredients in your pantry!")

    # Display the steps for each selected recipe
    print("\nRecipe Steps:")
    for recipe_name in selected:
        for category, recipes_in_category in recipes.items():
            if recipe_name in recipes_in_category:
                steps = recipes_in_category[recipe_name]["steps"]
                print(f"\nSteps for {recipe_name}:")
                for idx, step in enumerate(steps, 1):
                    print(f"{idx}. {step}")

    # Update the pantry to reflect the used quantities
    pantry.deduct_from_pantry(grocery_list)
    print("\nUpdated pantry after usage:")
    for item, quantity in pantry.pantry.items():
        print(f"- {item}: {format_quantity(quantity, item)}")

    # Save the updated pantry
    pantry.save_pantry()

if __name__ == "__main__":
    main()