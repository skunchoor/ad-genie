async function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById("generate").addEventListener("click", async () => {
  const title = document.getElementById("title").value;
  const features = document.getElementById("features").value
    .split("\n")
    .map(f => f.trim())
    .filter(Boolean);
  const tone = document.getElementById("tone").value;
  const keywords = document.getElementById("keywords").value
    .split(",")
    .map(k => k.trim())
    .filter(Boolean);

  const imageFile = document.getElementById("image").files[0];
  let imageData = null;
  if (imageFile) {
    imageData = await toBase64(imageFile); // full data:image/png;base64,... string
  }

  try {
    const res = await fetch("http://localhost:5000/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        features,
        tone,
        keywords,
        image: imageData
      })
    });

    const data = await res.json();
    const results = document.getElementById("results");
    results.innerHTML = "";

    if (data.options) {
      data.options.forEach(o => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<h4>${o.headline}</h4><p>${o.body}</p><strong>${o.cta}</strong>`;
        results.appendChild(div);
      });
    } else {
      results.textContent = JSON.stringify(data);
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
});
