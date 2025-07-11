from flask import Flask, jsonify, request
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
from PIL import Image
import io
import requests
import os
import time
import json
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from werkzeug.utils import secure_filename
import subprocess

# ─── Configuration ─────────────────────────────────────────────────────────────
PI_SERVER_URL = "https://gardenpi.duckdns.org/"
IMAGE_PATH = './uploads/latest.jpg'
mongo_uri = "secret"
client = MongoClient(mongo_uri)
db = client["sensor_data"]
collection = db["analyzed_readings"]

# ─── Flask Setup ───────────────────────────────────────────────────────────────
app = Flask(__name__)
os.makedirs('./uploads', exist_ok=True)

# ─── Helpers ───────────────────────────────────────────────────────────────────

def is_logged_in(driver):
    try:
        driver.find_element(By.TAG_NAME, "textarea")
        return True
    except NoSuchElementException:
        return False

def wait_for_login(driver, timeout=60):
    for _ in range(timeout):
        if is_logged_in(driver):
            return True
        time.sleep(1)
    return False

def get_latest_response(driver, timeout=40, initial_wait=90):
    time.sleep(initial_wait)
    for _ in range(timeout):
        try:
            response_blocks = driver.find_elements(By.CSS_SELECTOR, "div.markdown.prose")
            if response_blocks:
                last_block = response_blocks[-1]
                text = last_block.text.strip()
                if text:
                    return text
        except Exception as e:
            print("Error reading response:", e)
        time.sleep(2)
    return "No response received."

def clean_escaped_json_string(input_str):
    input_str = input_str[input_str.find("{"):]
    if input_str.startswith('"') and input_str.endswith('"'):
        input_str = input_str[1:-1]
    input_str = input_str.replace('\\"', '"').replace('\\n', '').replace('\\\\', '')
    return json.loads(input_str)

def upload_file(driver, file_path):
    wait = WebDriverWait(driver, 20)
    file_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='file']")))
    file_input.send_keys(os.path.abspath(file_path))
    time.sleep(2)

def send_prompt_via_js(driver, message):
    escaped = message.replace("`", "\\`").replace("\n", "\\n")
    js = f"""
    const prompt = document.querySelector('#prompt-textarea p');
    if (prompt) {{
        prompt.innerText = `{escaped}`;
        prompt.dispatchEvent(new InputEvent('input', {{ bubbles: true }}));
    }}
    """
    driver.execute_script(js)
    time.sleep(1)
    send_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@data-testid='send-button']"))
    )
    send_btn.click()

def send_to_chatgpt(sensor_text, image_path):
    PROFILE_DIR = os.path.join(os.getcwd(), "chrome_profile")
    options = Options()
    options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
    service = Service("/usr/bin/chromedriver")  # You confirmed this exists and works
    driver = webdriver.Chrome(service=service, options=options)
    driver.get("https://chatgpt.com/g/g-p-682885f591708191b0a8601db28de393-basil-expert/project")
    time.sleep(8)
    if not is_logged_in(driver):
        print("Please log in manually.")
        if not wait_for_login(driver, timeout=90):
            driver.quit()
            return "Login failed or timed out."
    try:
        upload_file(driver, image_path)
        message = f"This is my plant and its sensor data:\n{sensor_text}"
        send_prompt_via_js(driver, message)
        print("Message sent. Waiting for response...")
        response = get_latest_response(driver)
    except Exception as e:
        print("Error during interaction:", e)
        response = "Failed to send or get response."
    finally:
        driver.quit()
    return response

# ─── Flask Routes ──────────────────────────────────────────────────────────────
@app.route('/submit', methods=['GET'])
def handle_submit():
    try:
        sensor_res = requests.get(f"{PI_SERVER_URL}/", timeout=5)
        sensor_data = sensor_res.json()
        sensor_text = (
            f"Temperature: {sensor_data['temperature']['value']}°C\n"
            f"Humidity: {sensor_data['humidity']['value']}%\n"
            f"Soil Moisture: {sensor_data['soil']['percent']}% "
            f"(Raw: {sensor_data['soil']['raw']})"
        )
        image_res = requests.get(f"{PI_SERVER_URL}/photo", timeout=5)
        if image_res.status_code != 200:
            return jsonify({"error": "Failed to get image from Pi"}), 500
        with open(IMAGE_PATH, 'wb') as f:
            f.write(image_res.content)
        response = send_to_chatgpt(sensor_text, IMAGE_PATH)
        print(response)
        return clean_escaped_json_string(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/submit2', methods=['POST'])
def handle_submit2():
    try:
        # 1. Get image file from request
        if 'image' not in request.files:
            return jsonify({"error": "Image file missing"}), 400

        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({"error": "Empty image file name"}), 400

        filename = secure_filename(image_file.filename)
        image_path = os.path.join('./uploads', filename)
        image_file.save(image_path)

        # 2. Fetch sensor data from Pi
        sensor_res = requests.get(f"{PI_SERVER_URL}/", timeout=5)
        sensor_data = sensor_res.json()

        sensor_text = (
            f"Temperature: {sensor_data['temperature']['value']}°C\n"
            f"Humidity: {sensor_data['humidity']['value']}%\n"
            f"Soil Moisture: {sensor_data['soil']['percent']}% "
            f"(Raw: {sensor_data['soil']['raw']})"
        )

        # 3. Send to ChatGPT
        response = send_to_chatgpt(sensor_text, image_path)
        print(response)
        return clean_escaped_json_string(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def convert(doc):
    doc["_id"] = str(doc["_id"])
    if "timestamp" in doc and isinstance(doc["timestamp"], datetime):
        doc["timestamp"] = doc["timestamp"].isoformat()
    return doc
 
@app.route("/graph", methods=["GET"])
def get_latest_tips():
    # שולף את 10 ההודעות האחרונות לפי תאריך ירידה
    docs = list(collection.find().sort("timestamp", -1).limit(10))
    tips = [convert(doc) for doc in docs]
    return jsonify(tips)

# ─── Start Server ──────────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
