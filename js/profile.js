const SUPABASE_URL = "https://uidcjsffxgbvutmafero.supabase.co";
const SUPABASE_KEY = "sb_publishable_M6B_Tu9OdCBh6hpp6EKRGw_J_10xUSx";

const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const profileBio = document.getElementById("profileBio");
const profileAvatar = document.getElementById("profileAvatar");
const publicLinks = document.getElementById("publicLinks");

async function loadProfile() {
  // 1. Try getting username from URL parameter (?username=nelson)
  let username = new URLSearchParams(window.location.search).get("username");

  // 2. Fall back to clean URL path (/nelson)
  if (!username) {
    const segments = window.location.pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    if (
      lastSegment &&
      lastSegment !== "profile.html" &&
      lastSegment !== "index.html" &&
      lastSegment !== "dashboard.html"
    ) {
      username = lastSegment;
    }
  }

  if (!username) {
    if (profileName) profileName.textContent = "Profile not found";
    if (profileUsername) profileUsername.textContent = "";
    if (publicLinks) publicLinks.innerHTML = "";
    return;
  }

  try {
    const profileResponse = await fetch(
      SUPABASE_URL +
      "/rest/v1/profiles?username=eq." +
      encodeURIComponent(username) +
      "&select=*",
      {
        headers: {
          "apikey": SUPABASE_KEY
        }
      }
    );

    const profiles = await profileResponse.json();

    if (!profiles || !profiles.length) {
      if (profileName) profileName.textContent = "Profile not found";
      if (profileUsername) profileUsername.textContent = "";
      if (publicLinks) publicLinks.innerHTML = "";
      return;
    }

    const profile = profiles[0];

    if (profileName) profileName.textContent = profile.display_name || profile.username;
    if (profileUsername) profileUsername.textContent = "@" + profile.username;
    if (profileBio) profileBio.textContent = profile.bio || "";

    if (profileAvatar) {
      if (profile.avatar_url) {
        profileAvatar.innerHTML = `
          <img
            src="${profile.avatar_url}"
            alt="${profile.username}"
          >
        `;
      } else {
        profileAvatar.textContent = (
          profile.display_name ||
          profile.username ||
          "T"
        ).charAt(0).toUpperCase();
      }
    }

    const linksResponse = await fetch(
      SUPABASE_URL +
      "/rest/v1/links?user_id=eq." +
      profile.id +
      "&select=*&order=position.asc",
      {
        headers: {
          "apikey": SUPABASE_KEY
        }
      }
    );

    const links = await linksResponse.json();

    if (publicLinks) {
      publicLinks.innerHTML = "";

      if (!links || !links.length) {
        publicLinks.innerHTML = `
          <div class="profile-loading">
            No links yet.
          </div>
        `;
        return;
      }

      links.forEach(function (link) {
        const linkElement = document.createElement("a");
        linkElement.className = "public-link";
        linkElement.href = link.url;
        linkElement.target = "_blank";
        linkElement.rel = "noopener noreferrer";
        linkElement.textContent = link.title;
        publicLinks.appendChild(linkElement);
      });
    }

  } catch (error) {
    console.error(error);
    if (profileName) profileName.textContent = "Something went wrong";
    if (publicLinks) {
      publicLinks.innerHTML = `
        <div class="profile-loading">
          Could not load this profile.
        </div>
      `;
    }
  }
}

loadProfile();
