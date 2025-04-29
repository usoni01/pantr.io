from pantry import Pantry
from recipes import recipes
from grocery_list import GroceryList
from utils import format_quantity

def main():
    print("Welcome to the Grocery List Generator!")
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
        for idx, name in enumerate(recipes.keys(), 1):
            print(f"{idx}. {name}")
        choice = input("Select a recipe by number (or 'done' to finish): ").strip()
        if choice.lower() == "done":
            break
        try:
            idx = int(choice) - 1
            recipe_name = list(recipes.keys())[idx]
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
    grocery_list = GroceryList.generate(selected, servings)

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

    # Update the pantry to reflect the used quantities
    pantry.deduct_from_pantry(grocery_list)
    print("\nUpdated pantry after usage:")
    for item, quantity in pantry.pantry.items():
        print(f"- {item}: {format_quantity(quantity, item)}")

    # Save the updated pantry
    pantry.save_pantry()

if __name__ == "__main__":
    main()