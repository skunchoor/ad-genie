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

        // Add Judge Button
        const judgeBtn = document.createElement("button");
        judgeBtn.textContent = "Judge this Option";
        judgeBtn.className = "judge-btn"; // You might want to style this
        judgeBtn.style.marginTop = "10px";
        judgeBtn.onclick = async () => {
          judgeBtn.textContent = "Judging...";
          judgeBtn.disabled = true;
          try {
            const judgeRes = await fetch("http://localhost:5000/api/judge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title, features, tone, keywords,
                generated_content: `Headline: ${o.headline}\nBody: ${o.body}\nCTA: ${o.cta}`
              })
            });
            const judgeData = await judgeRes.json();

            const judgeDiv = document.getElementById("judge-results");
            judgeDiv.style.display = "block";
            judgeDiv.innerHTML = `
                    <h5>Judge's Feedback (Score: ${judgeData.score}/10)</h5>
                    <p>${judgeData.feedback}</p>
                    ${judgeData.safety_flag ? '<strong style="color:red;">Safety Warning!</strong>' : ''}
                `;
            judgeDiv.scrollIntoView({ behavior: 'smooth' });

          } catch (e) {
            alert("Judge error: " + e.message);
          } finally {
            judgeBtn.textContent = "Judge this Option";
            judgeBtn.disabled = false;
          }
        };
        div.appendChild(judgeBtn);

        results.appendChild(div);
      });
    } else {
      results.textContent = JSON.stringify(data);
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
});
