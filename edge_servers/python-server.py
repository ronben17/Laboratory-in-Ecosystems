from flask import Flask, request, jsonify, Response
import adafruit_dht
import board
import serial
import re
import cv2                         # <-- NEW
import io

# ─── Serial Port Setup ─────────────────────────────────────────────────────────
SERIAL_PORT = '/dev/ttyUSB0'
BAUD_RATE = 9600
ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)

# ─── Configuration ─────────────────────────────────────────────────────────────
dhtDevice = adafruit_dht.DHT22(board.D4)

NAME       = "PiGrow"
dht1Name   = "D2"
strain     = ""
state      = "veg"
lights     = "none"
dryValue   = 620
wetValue   = 284

# ─── Flask Setup ───────────────────────────────────────────────────────────────
app = Flask(__name__)

# ─── Helpers ───────────────────────────────────────────────────────────────────
def read_dht():
    try:
        temperature = dhtDevice.temperature
        humidity    = dhtDevice.humidity
        return temperature, humidity
    except RuntimeError as error:
        # Happens a lot with DHTs; just let caller know it failed
        print(f"DHT reading error: {error}")
        return None, None

def get_soil_raw():
    line = ser.readline().decode('utf-8').strip()
    if line and "Soil moisture raw:" in line:
        m = re.search(r"(\d+)", line)
        if m:
            return int(m.group(1))
    return None

def get_soil_percent(raw):
    global dryValue, wetValue
    if raw is None:
        return None
    # keep auto-calibrating the min/max
    if dryValue < raw < dryValue * 1.05:
        dryValue = raw
    elif wetValue > raw > wetValue * 0.95:
        wetValue = raw
    return max(0, min(100, int((dryValue - raw) * 100 / (dryValue - wetValue))))

# ─── Routes ────────────────────────────────────────────────────────────────────
@app.route('/')
def sensor_data():
    t1, h1       = read_dht()
    soil_raw     = get_soil_raw()
    soil_percent = get_soil_percent(soil_raw)

    return jsonify({
        "temperature": {"value": t1, "unit": "C"},
        "humidity":    {"value": h1, "unit": "%"},
        "soil":        {"percent": soil_percent, "raw": soil_raw}
    })

@app.route('/config')
def handle_config():
    global strain, state, lights, dryValue, wetValue, dht1Name
    strain   = request.args.get("strain", strain)
    state    = request.args.get("state",  state)
    lights   = request.args.get("lights", lights)
    dryValue = int(request.args.get("dry", dryValue))
    wetValue = int(request.args.get("wet", wetValue))
    dht1Name = request.args.get("dht1", dht1Name)

    return jsonify({
        "strain": strain,
        "state":  state,
        "lights": lights,
        "dry":    dryValue,
        "wet":    wetValue,
        "dht1":   dht1Name
    })

# ── NEW: take a snapshot and stream JPEG ───────────────────────────────────────
@app.route('/photo')
def take_photo():
    cam = cv2.VideoCapture(0)           # opens /dev/video0
    if not cam.isOpened():
        return jsonify({"error": "Cannot open camera"}), 500
    # Set resolution to 1280x720 (720p)
    cam.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    # Warm up camera (recommended)
    for _ in range(5):
        cam.read()
        cv2.waitKey(30)  # Small delay can help with focus/exposure sync

    ok, frame = cam.read()
    cam.release()

    if not ok:
        return jsonify({"error": "Failed to capture image"}), 500

    ok, jpeg = cv2.imencode('.jpg', frame)
    if not ok:
        return jsonify({"error": "JPEG encode failed"}), 500

    return Response(jpeg.tobytes(), mimetype='image/jpeg')

# ─── Start Server ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # For production use, put this behind gunicorn or uWSGI
    app.run(host='0.0.0.0', port=42042, threaded=True)