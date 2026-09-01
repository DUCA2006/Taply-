const SUPABASE_URL = "https://uidcjsffxgbvutmafero.supabase.co";
const SUPABASE_KEY = "sb_publishable_M6B_Tu9OdCBh6hpp6EKRGw_J_10xUSx";

const form = document.getElementById("signupForm");
const message = document.getElementById("signupMessage");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim().toLowerCase();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !email || !password) {
    message.textContent = "Please fill in all fields.";
    return;
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    message.textContent = "Username can only use letters, numbers and underscores.";
    return;
  }

  message.textContent = "Creating your Taply…";

  try {
    const response = await fetch(
      SUPABASE_URL + "/auth/v1/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.msg ||
        data.message ||
        data.error_description ||
        "Signup failed."
      );
    }

    if (!data.user) {
      message.textContent = "Account created. Check your email to confirm it.";
      return;
    }

    const profileResponse = await fetch(
      SUPABASE_URL + "/rest/v1/profiles",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + SUPABASE_KEY,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          id: data.user.id,
          username: username,
          display_name: username
        })
      }
    );

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      throw new Error(errorText || "Profile creation failed.");
    }

    message.textContent = "Taply account created! 🎉";
    setTimeout(function () {
      window.location.href = "dashboard.html";
    }, 1000);

  } catch (error) {
    console.error(error);
    message.textContent = error.message;
  }
});





const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const loginMessage = document.getElementById("loginMessage");
    loginMessage.textContent = "Logging you in...";
    try {
      const response = await fetch(
        SUPABASE_URL + "/auth/v1/token?grant_type=password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_KEY
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.msg ||
          data.message ||
          data.error_description ||
          "Login failed."
        );
      }
      localStorage.setItem("taply_access_token", data.access_token);
      localStorage.setItem("taply_user", JSON.stringify(data.user));
      loginMessage.textContent = "Login successful! 🎉";
      setTimeout(function() {
        window.location.href = "dashboard.html";
      }, 800);
    } catch (error) {
      console.error(error);
      loginMessage.textContent = error.message;
    }
  });
}
