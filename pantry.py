import json
from utils import format_quantity

class Pantry:
    def __init__(self, filename="grocery_list.json"):
        self.filename = filename
        self.pantry = self.load_pantry()

    def load_pantry(self):
        """Load the pantry from a JSON file."""
        try:
            with open(self.filename, "r") as file:
                pantry = json.load(file)
                return {item: int(quantity) for item, quantity in pantry.items()}  # Convert to integers
        except FileNotFoundError:
            print(f"\nNo saved pantry found. Starting fresh.")
            return {}
        except Exception as e:
            print(f"Error loading pantry: {e}")
            return {}

    def save_pantry(self):
        """Save the pantry to a JSON file."""
        try:
            with open(self.filename, "w") as file:
                json.dump(self.pantry, file, indent=4)
            print(f"\nPantry saved to {self.filename}.")
        except Exception as e:
            print(f"Error saving pantry: {e}")

    def update_pantry(self):
        """Allow the user to update the pantry."""
        print("\nUpdate your pantry:")
        while True:
            print("\nCurrent pantry:")
            for item, quantity in self.pantry.items():
                print(f"- {item}: {format_quantity(quantity, item)}")
            
            choice = input("\nEnter the name of the ingredient to update (or 'done' to finish): ").strip()
            if choice.lower() == "done":
                break
            
            if choice in self.pantry:
                try:
                    new_quantity = int(input(f"Enter the new quantity for '{choice}' (in grams/ml): "))
                    if new_quantity < 0:
                        print("Quantity cannot be negative. Try again.")
                        continue
                    self.pantry[choice] = new_quantity
                    print(f"Updated '{choice}' to {new_quantity} grams/ml.")
                except ValueError:
                    print("Invalid input. Please enter a number.")
            else:
                try:
                    new_quantity = int(input(f"'{choice}' is not in the pantry. Enter the quantity to add it (in grams/ml): "))
                    if new_quantity < 0:
                        print("Quantity cannot be negative. Try again.")
                        continue
                    self.pantry[choice] = new_quantity
                    print(f"Added '{choice}' with {new_quantity} grams/ml to the pantry.")
                except ValueError:
                    print("Invalid input. Please enter a number.")

    def deduct_from_pantry(self, grocery_list):
        """Deduct the quantities used from the pantry."""
        for item, required_quantity in grocery_list.items():
            if item in self.pantry:
                self.pantry[item] = max(0, self.pantry[item] - required_quantity)  # Ensure no negative values
            else:
                print(f"Warning: '{item}' is not in the pantry. Cannot deduct.")