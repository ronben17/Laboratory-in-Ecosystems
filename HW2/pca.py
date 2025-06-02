import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import matplotlib
matplotlib.use("TkAgg")
import matplotlib.pyplot as plt

# ─────────────────────────────────────────────
# 1) קריאת הקובץ והכנת טבלה “שטוחה”
# ─────────────────────────────────────────────
file_path = "analyzed_readings_export.json"
df = pd.read_json(file_path)

sensor_df = df[["temperature", "humidity", "soil", "Health Score"]].copy()
sensor_df["temperature"] = sensor_df["temperature"].apply(lambda x: x["value"])
sensor_df["humidity"]    = sensor_df["humidity"].apply(lambda x: x["value"])
sensor_df["soil"]        = sensor_df["soil"].apply(lambda x: x["percent"])
sensor_df["score"]       = sensor_df["Health Score"].apply(lambda x: float(x["score"]))
sensor_df.drop(columns=["Health Score"], inplace=True)

features = ["temperature", "humidity", "soil"]

# ─────────────────────────────────────────────
# 2) נרמול + PCA (ללא סינון outliers)
# ─────────────────────────────────────────────
scaled = StandardScaler().fit_transform(sensor_df[features])
pca    = PCA(n_components=2)
pcs    = pca.fit_transform(scaled)
pca_df = pd.DataFrame(pcs, columns=["PC1", "PC2"])
pca_df["Health Score"] = sensor_df["score"]

# ─────────────────────────────────────────────
# 3) ציור Scatter + Biplot
# ─────────────────────────────────────────────
plt.figure(figsize=(9, 7))

scatter = plt.scatter(
    pca_df["PC1"], pca_df["PC2"],
    c=pca_df["Health Score"],
    cmap="viridis", s=80
)

for i, var in enumerate(features):
    vx, vy = pca.components_[0, i], pca.components_[1, i]
    plt.arrow(0, 0, vx*2.5, vy*2.5,
              color="red", width=0.02,
              head_width=0.15, length_includes_head=True)
    plt.text(vx*2.7, vy*2.7, var, color="red", fontsize=11)

plt.title(
    f"PCA Biplot of Basil Sensor Readings (with outliers)\n"
    f"(PC1 explains {pca.explained_variance_ratio_[0]*100:.1f}%, "
    f"PC2 {pca.explained_variance_ratio_[1]*100:.1f}%)"
)
plt.xlabel("Principal Component 1")
plt.ylabel("Principal Component 2")
plt.colorbar(scatter, label="Health Score")
plt.grid(True)
plt.tight_layout()
plt.show()
