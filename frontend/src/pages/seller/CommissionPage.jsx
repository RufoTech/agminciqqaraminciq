import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMonthlyCommission,
  doTransferCommission,
  doWithdrawBalance,
  clearCommissionState,
} from "../../slices/commissionSlice";
import BalanceWidget from "../../components/BalanceWidget";

const MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
  "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
];

const CommissionPage = () => {
  const dispatch = useDispatch();
  const { monthly, transferResult, withdrawResult, loading, error } =
    useSelector((state) => state.commission);

  // Redux-da user formatı: state.userSlice.user = { user: { id, name, email, role, sellerInfo } }
  // Navbar, AdminProducts hamısı user?.user?.role oxuyur — eyni format
  const { user: userWrapper } = useSelector((state) => state.userSlice);
  const user = userWrapper?.user; // { id, name, email, role, sellerStatus, sellerInfo }

  // sellerId — commissionController-da sellerId olaraq sellerInfo.storeName saxlanılıb
  // Bu səbəbdən sellerId olaraq storeName istifadə edilir
  // (createCommission çağırılanda da storeName göndərilməlidir)
  const sellerId   = user?.sellerInfo?.storeName || null;
  const sellerName = user?.name || "";

  const now = new Date();
  const [month, setMonth]                   = useState(now.getMonth() + 1);
  const [year, setYear]                     = useState(now.getFullYear());
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Stripe test paymentMethod ID — real proyektdə frontend-dən alınır
  const [paymentMethodId] = useState("pm_card_visa");

  useEffect(() => {
    if (sellerId) {
      dispatch(getMonthlyCommission({ sellerId, month, year }));
    }
  }, [sellerId, month, year, dispatch]);

  useEffect(() => {
    return () => dispatch(clearCommissionState());
  }, [dispatch]);

  useEffect(() => {
    if (transferResult?.receiptUrl) {
      window.open(`https://amdulraxim-production.up.railway.app${transferResult.receiptUrl}`, "_blank");
      if (sellerId) {
        dispatch(getMonthlyCommission({ sellerId, month, year }));
      }
    }
  }, [transferResult]);

  const handleTransfer = () => {
    if (!window.confirm("Komisyaları şirkətə köçürmək istəyirsiniz?")) return;
    dispatch(doTransferCommission({
      sellerId,
      sellerName,
      month,
      year,
      paymentMethodId,
    }));
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return alert("Məbləğ daxil edin");
    dispatch(doWithdrawBalance({ sellerId, amount }));
    setWithdrawAmount("");
  };

  // İstifadəçi hələ yüklənməyib
  if (!user) {
    return (
      <div style={s.page}>
        <div style={s.error}>⚠️ Zəhmət olmasa giriş edin.</div>
      </div>
    );
  }

  // Yalnız role="admin" olan istifadəçilər
  if (user.role !== "admin") {
    return (
      <div style={s.page}>
        <div style={s.error}>⚠️ Bu səhifəyə yalnız adminlər daxil ola bilər.</div>
      </div>
    );
  }

  // sellerId yoxdursa — sellerInfo doldurulmayıb
  if (!sellerId) {
    return (
      <div style={s.page}>
        <div style={s.error}>
          ⚠️ Mağaza məlumatları tapılmadı. Zəhmət olmasa yenidən giriş edin.
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>💰 Komisya Paneli</h1>

      {/* Balans kartları — sellerId (storeName) ilə çəkilir */}
      <BalanceWidget sellerId={sellerId} />

      {/* Ay / İl filtr */}
      <div style={s.filters}>
        <select
          style={s.select}
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          style={s.select}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Bildirişlər */}
      {error && <div style={s.error}>{error}</div>}
      {transferResult?.success && (
        <div style={s.success}>
          ✅ {transferResult.message} — PDF çek avtomatik açıldı!
        </div>
      )}
      {withdrawResult?.success && (
        <div style={s.success}>
          ✅ {withdrawResult.message} — Qalan balans:{" "}
          {withdrawResult.remainingBalance?.toFixed(2)} AZN
        </div>
      )}

      {/* Aylıq xülasə */}
      {monthly && (
        <div style={s.card}>
          <h2 style={s.cardTitle}>
            {MONTHS[month - 1]} {year} — Xülasə
          </h2>
          <div style={s.grid}>
            <div style={s.gridItem}>
              <span style={s.gridLabel}>Cəmi Satış</span>
              <span style={s.gridValue}>
                {monthly.totalOrderAmount?.toFixed(2)} AZN
              </span>
            </div>
            <div style={s.gridItem}>
              <span style={s.gridLabel}>Komisya (8%)</span>
              <span style={{ ...s.gridValue, color: "#E8192C" }}>
                -{monthly.totalCommission?.toFixed(2)} AZN
              </span>
            </div>
            <div style={s.gridItem}>
              <span style={s.gridLabel}>Satıcıya Qalan</span>
              <span style={{ ...s.gridValue, color: "#27ae60" }}>
                {monthly.totalSellerEarning?.toFixed(2)} AZN
              </span>
            </div>
            <div style={s.gridItem}>
              <span style={s.gridLabel}>Sifariş Sayı</span>
              <span style={s.gridValue}>{monthly.totalOrders}</span>
            </div>
          </div>

          {monthly.pendingAmount > 0 ? (
            <div style={s.transferBox}>
              <p style={{ margin: 0, fontSize: "15px" }}>
                <strong>{monthly.pendingAmount?.toFixed(2)} AZN</strong>{" "}
                komisya köçürülməyi gözləyir
              </p>
              <button
                style={{
                  ...s.transferBtn,
                  opacity: loading ? 0.6 : 1,
                  cursor:  loading ? "not-allowed" : "pointer",
                }}
                onClick={handleTransfer}
                disabled={loading}
              >
                {loading ? "Köçürülür..." : "💸 Transfer Et"}
              </button>
            </div>
          ) : (
            <div style={s.allDone}>
              ✅ Bu ayın bütün komisyaları köçürülüb
            </div>
          )}
        </div>
      )}

      {/* Sifarişlər cədvəli */}
      {monthly?.commissions?.length > 0 && (
        <div style={s.card}>
          <h2 style={s.cardTitle}>Sifarişlər</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  <th style={s.th}>Tarix</th>
                  <th style={s.th}>Satış</th>
                  <th style={s.th}>Komisya</th>
                  <th style={s.th}>Satıcıya qalan</th>
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {monthly.commissions.map((c) => (
                  <tr key={c._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={s.td}>
                      {new Date(c.createdAt).toLocaleDateString("az-AZ")}
                    </td>
                    <td style={s.td}>{c.orderAmount?.toFixed(2)} AZN</td>
                    <td style={{ ...s.td, color: "#E8192C" }}>
                      -{c.commissionAmount?.toFixed(2)} AZN
                    </td>
                    <td style={{ ...s.td, color: "#27ae60" }}>
                      {c.sellerEarning?.toFixed(2)} AZN
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          background:
                            c.status === "transferred" ? "#27ae60" : "#f39c12",
                        }}
                      >
                        {c.status === "transferred" ? "Köçürüldü" : "Gözləyir"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Boş vəziyyət */}
      {monthly && monthly.totalOrders === 0 && (
        <div style={s.empty}>
          📭 {MONTHS[month - 1]} {year} üçün sifariş tapılmadı
        </div>
      )}

      {/* Pul çəkiş */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>💳 Balansdan Pul Çək</h2>
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>
          Yalnız qazandığınız məbləği çəkə bilərsiniz
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <input
            style={s.input}
            type="number"
            min="0"
            placeholder="Məbləğ (AZN)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <button
            style={{
              ...s.withdrawBtn,
              opacity: loading ? 0.6 : 1,
              cursor:  loading ? "not-allowed" : "pointer",
            }}
            onClick={handleWithdraw}
            disabled={loading}
          >
            {loading ? "..." : "Çək"}
          </button>
        </div>
      </div>
    </div>
  );
};

const s = {
  page:        { maxWidth: "1000px", margin: "0 auto", padding: "32px 24px", fontFamily: "'Segoe UI', sans-serif", color: "#1a1a2e" },
  title:       { fontSize: "28px", fontWeight: "800", marginBottom: "28px" },
  filters:     { display: "flex", gap: "12px", marginBottom: "24px" },
  select:      { padding: "10px 16px", borderRadius: "10px", border: "2px solid #e0e0e0", fontSize: "14px", cursor: "pointer", outline: "none" },
  error:       { background: "#fdecea", color: "#c0392b", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px" },
  success:     { background: "#eafaf1", color: "#1e8449", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px" },
  empty:       { textAlign: "center", color: "#aaa", padding: "32px", fontSize: "15px", background: "#fff", borderRadius: "20px", marginBottom: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" },
  card:        { background: "#fff", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", marginBottom: "24px" },
  cardTitle:   { fontSize: "18px", fontWeight: "700", marginBottom: "20px" },
  grid:        { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" },
  gridItem:    { background: "#f8f9fa", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "6px" },
  gridLabel:   { fontSize: "12px", color: "#888" },
  gridValue:   { fontSize: "22px", fontWeight: "700" },
  transferBox: { background: "#fff0f0", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", border: "1px solid #ffd0d0" },
  transferBtn: { background: "linear-gradient(135deg, #E8192C, #ff6b6b)", border: "none", borderRadius: "12px", padding: "14px 28px", fontSize: "16px", fontWeight: "700", color: "#fff", transition: "opacity 0.2s" },
  allDone:     { background: "#eafaf1", color: "#1e8449", borderRadius: "12px", padding: "16px", textAlign: "center", fontWeight: "600" },
  table:       { width: "100%", borderCollapse: "collapse" },
  th:          { padding: "12px 16px", textAlign: "left", fontSize: "13px", color: "#888", fontWeight: "600" },
  td:          { padding: "14px 16px", fontSize: "14px" },
  badge:       { color: "#fff", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "600" },
  input:       { flex: 1, padding: "12px 16px", borderRadius: "12px", border: "2px solid #e0e0e0", fontSize: "15px", outline: "none" },
  withdrawBtn: { background: "linear-gradient(135deg, #E8192C, #ff6b6b)", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "15px", fontWeight: "700", color: "#fff", transition: "opacity 0.2s" },
};

export default CommissionPage;