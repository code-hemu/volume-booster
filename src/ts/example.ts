// Define an interface for a User object
interface User {
  name: string;
  age: number;
}

// Create an object that adheres to the User interface
let user: User = {
  name: "codehemu",
  age: 25,
};

// Attempting to add an undefined property or mismatch a type will result in an error
// user.email = "hello@codehemu.in"; // Error: Property 'email' does not exist on type 'User'.
console.log(`User: ${user.name}, Age: ${user.age}`);