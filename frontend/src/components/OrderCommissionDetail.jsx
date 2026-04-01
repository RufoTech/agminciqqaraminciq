import { useEffect, useState } from "react";
import axios from "axios";

const OrderCommissionDetail = ({ orderId }) => {
  const [commission, setCommission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    axios
      .get(
        `https://amdulraxim-production.up.railway.app/commerce/mehsullar/commission/order/${orderId}`,
        { withCredentials: true }
      )
      // ✅ Düzəliş: backend birbaşa { success, orderAmount, ... } qaytarır
      // commission adlı iç obyekt yoxdur
      .then((res) => setCommission(res.data))
      .catch(() => setCommission(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div style={styles.loading}>Yüklənir...</div>;
  if (!commission) return null;

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>💰 Komisya Məlumatı</h3>
      <div style={styles.rows}>
        <Row
          label="Sifarişin məbləği"
          value={`${commission.orderAmount?.toFixed(2)} AZN`}
        />
        <Row
          label={`Komisya (${commission.commissionPercentage}%)`}
          value={`-${commission.commissionAmount?.toFixed(2)} AZN`}
          red
        />
        <div style={styles.divider} />
        <Row
          label="Sizə qalan"
          value={`${commission.sellerEarning?.toFixed(2)} AZN`}
          green
          bold
        />
      </div>
      <div style={styles.statusBadge(commission.status)}>
        {commission.status === "transferred" ? "✅ Köçürüldü" : "⏳ Gözləyir"}
      </div>
    </div>
  );
};

const Row = ({ label, value, red, green, bold }) => (
  <div style={styles.row}>
    <span style={styles.label}>{label}</span>
    <span
      style={{
        ...styles.value,
        color: red ? "#e74c3c" : green ? "#27ae60" : "#1a1a2e",
        fontWeight: bold ? "700" : "500",
        fontSize: bold ? "18px" : "15px",
      }}
    >
      {value}
    </span>
  </div>
);

const styles = {
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    marginTop: "20px",
  },
  title: {
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "16px",
    color: "#1a1a2e",
  },
  rows: { display: "flex", flexDirection: "column", gap: "10px" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: "14px", color: "#888" },
  value: { fontSize: "15px" },
  divider: { height: "1px", background: "#f0f0f0", margin: "4px 0" },
  statusBadge: (status) => ({
    marginTop: "16px",
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    background: status === "transferred" ? "#eafaf1" : "#fff8e1",
    color: status === "transferred" ? "#1e8449" : "#e67e22",
  }),
  loading: { color: "#888", fontSize: "14px", padding: "12px" },
};

export default OrderCommissionDetail;