from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_encode_base64():
    response = client.post("/api/v1/base64/encode", json={"text": "hello"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["result"] == "aGVsbG8="


def test_decode_base64():
    response = client.post("/api/v1/base64/decode", json={"text": "aGVsbG8="})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["result"] == "hello"


def test_decode_base64_invalid():
    response = client.post("/api/v1/base64/decode", json={"text": "!!notbase64!!"})
    assert response.status_code == 400

