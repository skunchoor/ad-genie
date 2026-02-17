import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from unittest.mock import MagicMock, patch
import app
import json

@pytest.fixture
def client():
    app.app.config['TESTING'] = True
    with app.app.test_client() as client:
        yield client

def test_index_get(client):
    rv = client.get('/')
    assert rv.status_code == 200
    assert b"AdGenie" in rv.data

@patch('app.client.chat.completions.create')
def test_api_generate_success(mock_create, client):
    # Mocking OpenAI response
    mock_response = MagicMock()
    mock_response.choices[0].message.content = json.dumps({
        "options": [
            {"headline": "Test Headline", "body": "Test Body", "cta": "Buy Now"}
        ]
    })
    mock_create.return_value = mock_response

    data = {
        "title": "Test Product",
        "features": ["Feature 1", "Feature 2"],
        "tone": "Professional",
        "keywords": ["test", "product"]
    }
    
    rv = client.post('/api/generate', json=data)
    assert rv.status_code == 200
    json_data = rv.get_json()
    assert "options" in json_data
    assert json_data["options"][0]["headline"] == "Test Headline"

def test_api_judge_success(client):
    # Mocking the judge.evaluate method in app.py to avoid calling OpenAI
    with patch.object(app.judge, 'evaluate') as mock_evaluate:
        mock_evaluate.return_value = {
            "score": 8,
            "feedback": "Good job",
            "safety_flag": False
        }
        
        data = {
            "title": "Test Product",
            "features": ["Feature 1"],
            "tone": "Professional",
            "keywords": [],
            "generated_content": "Headline: Test\nBody: Test Body\nCTA: Buy"
        }
        
        rv = client.post('/api/judge', json=data)
        assert rv.status_code == 200
        json_data = rv.get_json()
        assert json_data["score"] == 8
        assert json_data["feedback"] == "Good job"

def test_api_judge_missing_content(client):
    data = {
        "title": "Test Product"
    }
    rv = client.post('/api/judge', json=data)
    assert rv.status_code == 400
