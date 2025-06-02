import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib
matplotlib.use("TkAgg")
import matplotlib.pyplot as plt
import json

# 1. טען את הנתונים מהקובץ JSON
with open("analyzed_readings_export.json", "r") as f:
    data = json.load(f)

# 2. הפוך את הנתונים לטבלה
records = []
for entry in data:
    records.append({
        "Temperature": entry["temperature"]["value"],
        "Humidity": entry["humidity"]["value"],
        "Soil_Moisture": entry["soil"]["percent"],
        "Health_Score": float(entry["Health Score"]["score"])
    })

df = pd.DataFrame(records)

# 3. הגדר משתנים
X = df[["Temperature", "Humidity", "Soil_Moisture"]]  # משתנים בלתי תלויים
y = df["Health_Score"]                                # משתנה תלוי

# 4. פיצול לסט אימון ובדיקה
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. יצירת ואימון המודל
model = LinearRegression()
model.fit(X_train, y_train)

# 6. חיזוי וביצועים
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

# 7. הדפסת ביצועים
print(f"Mean Squared Error (MSE): {mse:.2f}")
print(f"R² Score: {r2:.2f}")

# 8. גרף: תוצאה אמיתית מול תחזית
plt.scatter(y_test, y_pred)
plt.xlabel("Actual Health Score")
plt.ylabel("Predicted Health Score")
plt.title("Multiple Linear Regression: Actual vs Predicted")
plt.grid(True)
plt.show()
