async function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Screen Capture Logic
let imageData = null;

document.getElementById("capture-btn").addEventListener("click", () => {
  chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
    if (chrome.runtime.lastError) {
      alert("Error capturing screen: " + chrome.runtime.lastError.message);
      return;
    }
    imageData = dataUrl;
    const imgPreview = document.getElementById("screenshot-preview");
    imgPreview.src = dataUrl;
    imgPreview.style.display = "block";
  });
});

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

  // Image data is already set if captured


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
        judgeBtn.className = "judge-btn";
        judgeBtn.style.marginTop = "10px";
        judgeBtn.style.display = "block"; // Ensure it's on a new line

        // Container for THIS option's judge results
        const judgeResultDiv = document.createElement("div");
        judgeResultDiv.style.marginTop = "10px";
        judgeResultDiv.style.padding = "10px";
        judgeResultDiv.style.border = "1px solid #333";
        judgeResultDiv.style.borderRadius = "6px";
        judgeResultDiv.style.background = "#1e293b";
        judgeResultDiv.style.display = "none";

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

            // Fix [object Object] issue
            let feedbackText = judgeData.feedback;
            if (typeof feedbackText === 'object') {
              feedbackText = JSON.stringify(feedbackText, null, 2);
            }

            judgeResultDiv.style.display = "block";
            judgeResultDiv.innerHTML = `
                    <h5 style="margin-top:0; color: #818cf8;">Judge's Score: ${judgeData.score}/10</h5>
                    <p style="font-size: 0.9em; white-space: pre-wrap;">${feedbackText}</p>
                    ${judgeData.safety_flag ? '<strong style="color:red;">Safety Warning!</strong>' : ''}
                `;
            judgeResultDiv.scrollIntoView({ behavior: 'smooth' });

          } catch (e) {
            alert("Judge error: " + e.message);
          } finally {
            judgeBtn.textContent = "Judge this Option";
            judgeBtn.disabled = false;
          }
        };
        div.appendChild(judgeBtn);
        div.appendChild(judgeResultDiv);

        results.appendChild(div);
      });
    } else {
      results.textContent = JSON.stringify(data);
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
});
