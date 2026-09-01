const SUPABASE_URL = "https://uidcjsffxgbvutmafero.supabase.co";
const SUPABASE_KEY = "sb_publishable_M6B_Tu9OdCBh6hpp6EKRGw_J_10xUSx";

const accessToken = localStorage.getItem("taply_access_token");
const storedUser = localStorage.getItem("taply_user");

if (!accessToken || !storedUser) {
  window.location.href = "login.html";
}

const user = JSON.parse(storedUser);

const addLinkButton = document.getElementById("addLinkButton");
const linksContainer = document.getElementById("linksContainer");
const logoutButton = document.getElementById("logoutButton");

const displayNameInput = document.getElementById("displayName");
const bioInput = document.getElementById("bio");
const saveProfileButton = document.getElementById("saveProfileButton");
const profileMessage = document.getElementById("profileMessage");

async function loadProfile() {
  try {
    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/profiles?id=eq." +
      user.id +
      "&select=*",
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + accessToken
        }
      }
    );
    const profiles = await response.json();
    if (profiles.length > 0) {
      const profile = profiles[0];
      displayNameInput.value = profile.display_name || "";
      bioInput.value = profile.bio || "";
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadLinks() {
  try {
    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/links?user_id=eq." +
      user.id +
      "&order=position.asc",
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + accessToken
        }
      }
    );
    const links = await response.json();
    linksContainer.innerHTML = "";
    if (links.length === 0) {
      linksContainer.innerHTML = `
        <div class="empty-links">
          <div class="empty-icon">🔗</div>
          <h3>No links yet</h3>
          <p>Add your first link to get started.</p>
        </div>
      `;
      return;
    }
    links.forEach(function (link) {
      const linkElement = document.createElement("div");
      linkElement.className = "dashboard-link";
      linkElement.innerHTML = `
        <div class="dashboard-link-info">
          <strong>${escapeHtml(link.title)}</strong>
          <span>${escapeHtml(link.url)}</span>
        </div>
        <button
          class="delete-link"
          data-id="${link.id}"
        >
          Delete
        </button>
      `;
      linksContainer.appendChild(linkElement);
    });
    document.querySelectorAll(".delete-link").forEach(function (button) {
      button.addEventListener("click", function () {
        deleteLink(button.dataset.id);
      });
    });
  } catch (error) {
    console.error(error);
    linksContainer.innerHTML = `
      <div class="empty-links">
        <p>Could not load your links.</p>
      </div>
    `;
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function createLink() {
  const title = prompt("Enter your link title:");
  if (!title) return;

  let url = prompt("Enter the URL:");
  if (!url) return;

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  const response = await fetch(
    SUPABASE_URL + "/rest/v1/links",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + accessToken,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        user_id: user.id,
        title: title,
        url: url,
        position: Date.now()
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    alert("Could not add link: " + error);
    return;
  }

  loadLinks();
}

async function saveProfile() {
  profileMessage.textContent = "Saving…";

  const displayName = displayNameInput.value.trim();
  const bio = bioInput.value.trim();

  const response = await fetch(
    SUPABASE_URL +
    "/rest/v1/profiles?id=eq." +
    user.id,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + accessToken,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        display_name: displayName,
        bio: bio
      })
    }
  );

  if (!response.ok) {
    profileMessage.textContent = "Could not save profile.";
    return;
  }

  profileMessage.textContent = "Profile saved! 🎉";
}

addLinkButton.addEventListener("click", createLink);

saveProfileButton.addEventListener("click", saveProfile);

logoutButton.addEventListener("click", function () {
  localStorage.removeItem("taply_access_token");
  localStorage.removeItem("taply_user");
  window.location.href = "index.html";
});

loadProfile();
loadLinks();
