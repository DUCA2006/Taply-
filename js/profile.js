const SUPABASE_URL = "https://uidcjsffxgbvutmafero.supabase.co";
const SUPABASE_KEY = "sb_publishable_M6B_Tu9OdCBh6hpp6EKRGw_J_10xUSx";

const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const profileBio = document.getElementById("profileBio");
const profileAvatar = document.getElementById("profileAvatar");
const publicLinks = document.getElementById("publicLinks");

/* =========================
SOCIAL LINK DETECTION
========================= */

function getLinkIcon(url, title) {
  const lowerUrl = (url || "").toLowerCase();
  const lowerTitle = (title || "").toLowerCase();

  if (
    lowerUrl.includes("instagram.com") ||
    lowerTitle.includes("instagram")
  ) {
    return "◎";
  }

  if (
    lowerUrl.includes("tiktok.com") ||
    lowerTitle.includes("tiktok")
  ) {
    return "♪";
  }

  if (
    lowerUrl.includes("wa.me") ||
    lowerUrl.includes("whatsapp.com") ||
    lowerTitle.includes("whatsapp")
  ) {
    return "◉";
  }

  if (
    lowerUrl.includes("x.com") ||
    lowerUrl.includes("twitter.com") ||
    lowerTitle === "x"
  ) {
    return "𝕏";
  }

  if (
    lowerUrl.includes("facebook.com") ||
    lowerTitle.includes("facebook")
  ) {
    return "f";
  }

  if (
    lowerUrl.includes("snapchat.com") ||
    lowerTitle.includes("snapchat")
  ) {
    return "👻";
  }

  if (
    lowerUrl.includes("t.me") ||
    lowerUrl.includes("telegram.me") ||
    lowerTitle.includes("telegram")
  ) {
    return "➤";
  }

  if (
    lowerUrl.startsWith("mailto:") ||
    lowerTitle.includes("email") ||
    lowerTitle.includes("mail")
  ) {
    return "✉";
  }

  return "↗";
}

/* =========================
ESCAPE HTML
========================= */

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

/* =========================
LOAD PUBLIC PROFILE
========================= */

async function loadProfile() {
  /*
  1. Get username from: ?username=nelson
  */
  let username = new URLSearchParams(window.location.search).get("username");

  /*
  2. If there is no ?username, get it from the clean URL: /nelson
  */
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

  /*
  No username found
  */
  if (!username) {
    if (profileName) profileName.textContent = "Profile not found";
    if (profileUsername) profileUsername.textContent = "";
    if (publicLinks) publicLinks.innerHTML = "";
    return;
  }

  try {
    /* =========================
       GET PROFILE
    ========================= */
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

    if (!profileResponse.ok) {
      throw new Error("Failed to load profile");
    }

    const profiles = await profileResponse.json();

    /*
      Profile doesn't exist
    */
    if (!profiles || !profiles.length) {
      if (profileName) profileName.textContent = "Profile not found";
      if (profileUsername) profileUsername.textContent = "";
      if (publicLinks) {
        publicLinks.innerHTML = `
          <div class="profile-loading">
            This Taply profile does not exist.
          </div>
        `;
      }
      return;
    }

    const profile = profiles[0];

    /* =========================
       DISPLAY PROFILE
    ========================= */
    if (profileName) {
      profileName.textContent = profile.display_name || profile.username;
    }
    if (profileUsername) {
      profileUsername.textContent = "@" + profile.username;
    }
    if (profileBio) {
      profileBio.textContent = profile.bio || "";
    }

    /* =========================
       PROFILE PHOTO
    ========================= */
    if (profileAvatar) {
      if (profile.avatar_url) {
        profileAvatar.innerHTML = `
          <img
            src="${escapeHtml(profile.avatar_url)}"
            alt="${escapeHtml(profile.username)}"
          >
        `;
      } else {
        profileAvatar.innerHTML = `
          <span>
            ${escapeHtml(
              (
                profile.display_name ||
                profile.username ||
                "T"
              ).charAt(0).toUpperCase()
            )}
          </span>
        `;
      }
    }

    /* =========================
       GET USER LINKS
    ========================= */
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

    if (!linksResponse.ok) {
      throw new Error("Failed to load links");
    }

    const links = await linksResponse.json();

    if (!publicLinks) return;
    publicLinks.innerHTML = "";

    /* =========================
       NO LINKS
    ========================= */
    if (!links || !links.length) {
      publicLinks.innerHTML = `
        <div class="profile-loading">
          No links yet.
        </div>
      `;
      return;
    }

    /* =========================
       DISPLAY LINKS
    ========================= */
    links.forEach(function (link) {
      const linkElement = document.createElement("a");
      linkElement.className = "public-link";
      linkElement.href = link.url;
      linkElement.target = "_blank";
      linkElement.rel = "noopener noreferrer";

      const icon = getLinkIcon(link.url, link.title);

      linkElement.innerHTML = `
        <span class="public-link-icon">
          ${icon}
        </span>
        <span class="public-link-title">
          ${escapeHtml(link.title)}
        </span>
        <span class="public-link-arrow">
          ↗
        </span>
      `;
      publicLinks.appendChild(linkElement);
    });

  } catch (error) {
    console.error("Taply profile error:", error);
    if (profileName) {
      profileName.textContent = "Something went wrong";
    }
    if (publicLinks) {
      publicLinks.innerHTML = `
        <div class="profile-loading">
          Could not load this profile.
        </div>
      `;
    }
  }
}

/* =========================
START
========================= */

loadProfile();
