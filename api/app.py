import os, json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from openai import OpenAI
from google import genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AdGenie API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# LLM Clients Setup
# ------------------------

# 1. OpenAI (For Generation)
if os.getenv("OPENAI_API_TYPE") == "azure":
    openai_client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=f"{os.getenv('OPENAI_API_BASE')}/openai/deployments/{os.getenv('OPENAI_DEPLOYMENT')}",
        default_query={"api-version": os.getenv("OPENAI_API_VERSION")},
    )
    openai_model = os.getenv("OPENAI_DEPLOYMENT")
elif os.getenv("OPENAI_API_TYPE") == "ollama":
    openai_client = OpenAI(
        base_url="http://localhost:11434/v1",
    )
    openai_model = "gpt-oss:20b"
else:
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    openai_model = "gpt-4o-mini"

# 2. Gemini (For Evaluation/Judge)
# Relies on GEMINI_API_KEY environment variable implicitly or explicitly
gemini_client = genai.Client()
gemini_model = "gemini-2.5-flash"


# ------------------------
# Generation Logic
# ------------------------

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
    """Helper that talks to the OpenAI model"""
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

    response = openai_client.chat.completions.create(
        model=openai_model,
        temperature=0.8,
        max_tokens=900,
        messages=messages
    )

    raw = response.choices[0].message.content.strip()
    
    if raw.startswith("```json"):
        raw = raw[7:-3].strip()
    elif raw.startswith("```"):
        raw = raw[3:-3].strip()
        
    try:
        return json.loads(raw)
    except Exception:
        return {"options": [{"headline": "Generated Description", "body": raw, "cta": "Check it out"}]}


# ------------------------
# Judge Logic (Gemini)
# ------------------------

class Judge:
    def evaluate(self, original_input, generated_content):
        prompt = f"""You are an expert copy editor and compliance officer.
Evaluate the following e-commerce product description based on:
1. Relevance (Does it match the input features?)
2. Tone (Does it match the requested tone?)
3. Safety (Are there any prohibited or unsafe claims?)
4. SEO (Are keywords naturally integrated?)

Input:
{json.dumps(original_input, indent=2)}

Generated Content:
{generated_content}

Return a JSON object with:
- score (1-10)
- feedback (short summary of what is good and what needs improvement)
- safety_flag (boolean, true if unsafe)
"""
        try:
            # Using Gemini client for evaluation
            response = gemini_client.models.generate_content(
                model=gemini_model,
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    temperature=0.2,
                    response_mime_type="application/json"
                )
            )
            raw = response.text.strip()
            return json.loads(raw)
        except Exception as e:
            return {"score": 0, "feedback": f"Evaluation failed via Gemini: {str(e)}", "safety_flag": False}

judge = Judge()


# ------------------------
# API Endpoints
# ------------------------

@app.get("/")
async def root():
    return {"message": "AdGenie API is successfully running on Vercel!"}

class GenerateRequest(BaseModel):
    title: str
    features: List[str] = []
    tone: str
    keywords: List[str] = []
    image: Optional[str] = None

class JudgeRequest(BaseModel):
    title: str
    features: List[str] = []
    tone: str
    keywords: List[str] = []
    generated_content: str


@app.post("/api/generate")
async def api_generate(req: GenerateRequest):
    try:
        image_b64 = req.image
        if image_b64 and image_b64.startswith("data:image"):
            image_b64 = image_b64.split(",")[1]

        result = generate_descriptions(req.title, req.features, req.tone, req.keywords, image_b64)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/judge")
async def api_judge(req: JudgeRequest):
    original_input = {
        "title": req.title,
        "features": req.features,
        "tone": req.tone,
        "keywords": req.keywords
    }
    
    if not req.generated_content:
        raise HTTPException(status_code=400, detail="No generated content provided")

    result = judge.evaluate(original_input, req.generated_content)
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.app:app", host="0.0.0.0", port=5000, reload=True)