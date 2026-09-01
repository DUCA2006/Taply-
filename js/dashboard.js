const SUPABASE_URL = "https://uidcjsffxgbvutmafero.supabase.co";
const SUPABASE_KEY = "sb_publishable_M6B_Tu9OdCBh6hpp6EKRGw_J_10xUSx";

const accessToken = localStorage.getItem("taply_access_token");
const storedUser = localStorage.getItem("taply_user");

if (!accessToken || !storedUser) {
  window.location.href = "login.html";
}

const user = JSON.parse(storedUser || "{}");

const addLinkButton = document.getElementById("addLinkButton");
const linksContainer = document.getElementById("linksContainer");
const logoutButton = document.getElementById("logoutButton");

const displayNameInput = document.getElementById("displayName");
const bioInput = document.getElementById("bio");
const saveProfileButton = document.getElementById("saveProfileButton");
const profileMessage = document.getElementById("profileMessage");

const myPublicLink = document.getElementById("myPublicLink");
const previewButton = document.getElementById("previewButton");

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
      if (displayNameInput) displayNameInput.value = profile.display_name || "";
      if (bioInput) bioInput.value = profile.bio || "";

      // CLEAN VERCEL URL FOR BIO SHARE
      if (profile.username) {
        const fullUrl = "https://taply-coral.vercel.app/" + profile.username;
        
        if (myPublicLink) {
          myPublicLink.href = fullUrl;
          myPublicLink.textContent = fullUrl;
        }

        if (previewButton) {
          previewButton.href = fullUrl;
        }
      }
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
    if (!linksContainer) return;

    linksContainer.innerHTML = "";
    if (!Array.isArray(links) || links.length === 0) {
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
    if (linksContainer) {
      linksContainer.innerHTML = `
        <div class="empty-links">
          <p>Could not load your links.</p>
        </div>
      `;
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
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
        position: Math.floor(Date.now() / 1000)
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

async function deleteLink(id) {
  if (!confirm("Are you sure you want to delete this link?")) return;

  const response = await fetch(
    SUPABASE_URL + "/rest/v1/links?id=eq." + id,
    {
      method: "DELETE",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + accessToken
      }
    }
  );

  if (!response.ok) {
    alert("Could not delete link.");
    return;
  }

  loadLinks();
}

async function saveProfile() {
  if (profileMessage) profileMessage.textContent = "Saving…";

  const displayName = displayNameInput ? displayNameInput.value.trim() : "";
  const bio = bioInput ? bioInput.value.trim() : "";

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
    if (profileMessage) profileMessage.textContent = "Could not save profile.";
    return;
  }

  if (profileMessage) profileMessage.textContent = "Profile saved! 🎉";
}

if (addLinkButton) addLinkButton.addEventListener("click", createLink);

if (saveProfileButton) saveProfileButton.addEventListener("click", saveProfile);

if (logoutButton) {
  logoutButton.addEventListener("click", function () {
    localStorage.removeItem("taply_access_token");
    localStorage.removeItem("taply_user");
    window.location.href = "index.html";
  });
}

loadProfile();
loadLinks();
