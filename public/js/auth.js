// public/js/auth.js

// Elements for toggling the view
const signupBtn = document.getElementById("signup-btn");
const signinBtn = document.getElementById("signin-btn");
const mainContainer = document.querySelector(".container");

// Toggle the view between sign-up and sign-in forms
signupBtn.addEventListener("click", () => {
  mainContainer.classList.toggle("change");
});
signinBtn.addEventListener("click", () => {
  mainContainer.classList.toggle("change");
});

// Form submission for user registration
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.user) {
      console.log("User registered:", data.user);
      alert("Registration successful!");
      mainContainer.classList.toggle("change"); // Switch to sign-in view after successful registration
    } else {
      console.error("Registration error:", data.error);
      alert("Registration failed: " + data.error);
    }
  } catch (error) {
    console.error("Error during registration:", error);
    alert("Registration error: " + error.message);
  }
});

// Form submission for user sign-in
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.user) {
      console.log("Signed in:", data.user);
      alert("Sign-in successful!");
      // Redirect or navigate to another page after successful sign-in
    } else {
      console.error("Sign-in error:", data.error);
      alert("Sign-in failed: " + data.error);
    }
  } catch (error) {
    console.error("Error during sign-in:", error);
    alert("Sign-in error: " + error.message);
  }
});
