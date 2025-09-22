
const SUPABASE_URL = "https://fkpoitotkcsmcazmwnrv.supabase.co"; // replace with your URL
const SUPABASE_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcG9pdG90a2NzbWNhem13bnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NTIwNzksImV4cCI6MjA3NDAyODA3OX0._4oz8G569sVv2pKS_uPR-0bAsWv3YpVyNRrb1Ki1qDk"; // anon key
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


const form = document.getElementById("skillForm");
const skillsList = document.getElementById("skillsList");
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const matchBtn = document.getElementById("matchBtn");

const matchesList = document.getElementById("matchesList");


function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const year = document.getElementById("year").value.trim();
    const teach = document.getElementById("teach").value.trim();
    const learn = document.getElementById("learn").value.trim();

    if (!name || !email || !year || !teach || !learn) {
      alert("Please fill all fields!");
      return;
    }

    const { error } = await supabase.from("skills").insert([
      { name, email, year, teach, learn },
    ]);

    if (error) {
      alert("Error adding skill: " + error.message);
      console.error(error);
      return;
    }

    alert("Skill added successfully!");
    form.reset();
  });
}


async function renderSkills(filter = "") {
  if (!skillsList) return;
  const { data: skills, error } = await supabase.from("skills").select("*");

  if (error) {
    skillsList.innerHTML =
      "<p class='text-red-500'>Error loading skills.</p>";
    console.error(error);
    return;
  }

  const q = (filter || "").toLowerCase().trim();
  skillsList.innerHTML = "";

  const filtered = skills.filter(
    (s) =>
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.year?.toLowerCase().includes(q) ||
      s.teach?.toLowerCase().includes(q) ||
      s.learn?.toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    skillsList.innerHTML =
      "<p class='text-gray-500'>No matching skills found.</p>";
    return;
  }

  filtered.forEach((skill) => {
    const card = document.createElement("div");
    card.className =
      "p-4 bg-white rounded shadow hover:bg-gray-100 transition duration-200";
    card.innerHTML = `
      <div class="font-semibold text-indigo-700">${escapeHtml(
        skill.name
      )}</div>
      <div class="text-sm text-gray-600">${escapeHtml(
        skill.year
      )} • ${escapeHtml(skill.email)}</div>
      <div class="mt-2"><strong>Can teach:</strong> <em>${escapeHtml(
        skill.teach
      )}</em></div>
      <div><strong>Wants to learn:</strong> <em>${escapeHtml(
        skill.learn
      )}</em></div>
    `;
    skillsList.appendChild(card);
  });
}


if (searchInput) {
  searchInput.addEventListener("input", (e) =>
    renderSkills(e.target.value || "")
  );
}


if (clearBtn) {
  clearBtn.addEventListener("click", async () => {
    if (!confirm("Clear all skills?")) return;
    const { error } = await supabase.from("skills").delete().neq("id", 0);
    if (error) console.error(error);
    renderSkills(searchInput ? searchInput.value : "");
    if (matchesList) matchesList.innerHTML = "";
  });
}


if (skillsList) renderSkills();


async function renderMatches() {
  if (!matchesList) return;
  const { data: skills, error } = await supabase.from("skills").select("*");

  if (error) {
    matchesList.innerHTML =
      "<p class='text-red-500'>Error loading skills.</p>";
    console.error(error);
    return;
  }

  matchesList.innerHTML = "";

  for (let i = 0; i < skills.length; i++) {
    for (let j = i + 1; j < skills.length; j++) {
      if (
        skills[i].teach?.toLowerCase() === skills[j].learn?.toLowerCase() &&
        skills[i].learn?.toLowerCase() === skills[j].teach?.toLowerCase()
      ) {
        const card = document.createElement("div");
        card.className =
          "p-4 bg-yellow-100 rounded shadow transition duration-200";
        card.innerHTML = `
          <p><strong>${escapeHtml(skills[i].name)}</strong> (${escapeHtml(
          skills[i].email
        )}) ↔ <strong>${escapeHtml(skills[j].name)}</strong> (${escapeHtml(
          skills[j].email
        )})</p>
          <p>${escapeHtml(skills[i].teach)} ⇆ ${escapeHtml(
          skills[i].learn
        )}</p>
        `;
        matchesList.appendChild(card);
      }
    }
  }

  if (matchesList.innerHTML === "") {
    matchesList.innerHTML =
      "<p class='text-gray-500'>No matches found yet. Add more skills!</p>";
  }
}


if (matchBtn) {
  matchBtn.addEventListener("click", renderMatches);
}

