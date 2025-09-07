from flask import Flask, render_template, request
from openai import OpenAI
import os, json, base64
from dotenv import load_dotenv


load_dotenv()


app = Flask(__name__)


# Configure OpenAI client


# Optional Azure setup
if os.getenv("OPENAI_API_TYPE") == "azure":
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=f"{os.getenv('OPENAI_API_BASE')}/openai/deployments/{os.getenv('OPENAI_DEPLOYMENT')}",
        default_query={"api-version": os.getenv("OPENAI_API_VERSION")},
    )
    model = os.getenv("OPENAI_DEPLOYMENT")
elif os.getenv("OPENAI_API_TYPE") == "ollama":
    client = OpenAI(
        base_url="http://localhost:11434/v1",
    )
    model = "gpt-oss:20b"
else:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    model = "gpt-4o-mini"


# Prompt builder
def build_prompt(title, features, tone, keywords=None):
    return f"""You are AdGenie, an expert e-commerce copywriter.
Write 3 distinct product descriptions for the product below.
Each ~120-160 words, {tone} tone, persuasive, benefit-focused, skimmable paragraphs.
Include a short headline and a 1-line CTA. Integrate SEO keywords naturally.
Avoid fabricating specs. Do not include unsafe or prohibited items.


Product title: {title}
Key features (bullet-to-benefit):
{chr(10).join(f'- {f}' for f in features)}
SEO keywords: {', '.join(keywords) if keywords else 'n/a'}


Return JSON with shape:
{{
    "options": [
        {{"headline": string, "body": string, "cta": string}}
    ]
}}"""


def generate_descriptions(title, features, tone, keywords, image_b64=None):
    """Helper that talks to the model, used by both UI and API"""
    user_prompt = build_prompt(title, features, tone, keywords)

    messages = [
        {"role": "system", "content": "You return STRICT JSON only."},
        {"role": "user", "content": [{"type": "text", "text": user_prompt}]}
    ]

    if image_b64:
        messages[1]["content"].append({
            "type": "image_url",
            "image_url": {"url": f"data:image/png;base64,{image_b64}"}
        })

    response = client.chat.completions.create(
        model=MODEL,
        temperature=0.8,
        max_tokens=900,
        messages=messages
    )

    raw = response.choices[0].message.content.strip()
    try:
        return json.loads(raw)
    except Exception:
        return {"options": [{"headline": "Option A", "body": raw, "cta": "Shop now"}]}

# ---------------- #
# 1. HTML Form UI  #
# ---------------- #
@app.route("/", methods=["GET", "POST"])
def index():
    data, err = None, None
    if request.method == "POST":
        title = request.form.get("title")
        features = [f.strip("-• ") for f in request.form.get("features", "").split("\n") if f.strip()]
        tone = request.form.get("tone")
        keywords = [k.strip() for k in request.form.get("keywords", "").split(",") if k.strip()]
        image_file = request.files.get("image")

        user_prompt = build_prompt(title, features, tone, keywords)

        image_b64 = None
        if image_file:
            image_b64 = base64.b64encode(image_file.read()).decode("utf-8")

        try:
            data = generate_descriptions(title, features, tone, keywords, image_b64)
        except Exception as e:
            err = str(e)

    return render_template("index.html", data=data, err=err)


# ------------------------
# 2. JSON API (for extension)
# ------------------------
@app.route("/api/generate", methods=["POST"])
def api_generate():
    body = request.json
    title = body.get("title")
    features = body.get("features", [])
    tone = body.get("tone")
    keywords = body.get("keywords", [])
    image_b64 = body.get("image")

    # Allow inline base64 image string
    if "image" in body and body["image"]:
        if body["image"].startswith("data:image"):
            # strip prefix like data:image/png;base64,
            image_b64 = body["image"].split(",")[1]
        else:
            image_b64 = body["image"]

    try:
        result = generate_descriptions(title, features, tone, keywords, image_b64)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)