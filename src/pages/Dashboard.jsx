import { useEffect, useState } from "react";
import API from "../api";
import "./style/Dashboard.css";

function DashboardCard({ title, value, color }) {
  return (
    <div className={`card dashboard-card ${color}`}>
      <div className="card-body">
        <h6>{title}</h6>
        <h3>{value}</h3>
      </div>
    </div>
  );
}

function Dashboard() {

  const [materials, setMaterials] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [todayIn, setTodayIn] = useState(0);
  const [todayOut, setTodayOut] = useState(0);

  const [lowStock, setLowStock] = useState([]);
  const [outStock, setOutStock] = useState([]);


  const loadDashboard = async () => {
  try {

    // 🚀 PARALLEL API CALLS (FASTER)
    const [matRes, stockRes, sinRes, soutRes] = await Promise.all([
      API.get("/materials"),
      API.get("/currentstock"),
      API.get("/stockin"),
      API.get("/stockout")
    ]);

    const mat = matRes.data || [];
    const stock = stockRes.data || [];
    const sin = sinRes.data || [];
    const sout = soutRes.data || [];

    // 📊 TOTAL MATERIALS
    setMaterials(mat.length);

    // 📦 TOTAL STOCK
    const total = stock.reduce((sum, s) => sum + (s.currentStock || 0), 0);
    setTotalStock(total);

    // 📅 TODAY DATE
    const today = new Date().toISOString().split("T")[0];

    // 📥 TODAY IN
    const inQty = sin
      .filter(d => d.date === today)
      .reduce((sum, d) => sum + (d.qty || 0), 0);

    setTodayIn(inQty);

    // 📤 TODAY OUT
    const outQty = sout
      .filter(d => d.date === today)
      .reduce((sum, d) => sum + (d.qty || 0), 0);

    setTodayOut(outQty);

    // ⚠️ LOW STOCK (<10)
    const low = stock.filter(s =>
      (s.currentStock || 0) > 0 && (s.currentStock || 0) < 10
    );
    setLowStock(low);

    // ❌ OUT OF STOCK (=0)
    const out = stock.filter(s => (s.currentStock || 0) === 0);
    setOutStock(out);

  } catch (err) {
    console.error("Dashboard Load Error:", err);
  }
};

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  loadDashboard();
}, []);

  return (
    <div className="stock-page">

      <h3 className="dashboard-title">Inventory Dashboard</h3>

      {/* ✅ KPI CARDS */}
      <div className="row g-3">

        <div className="col-md-3">
          <DashboardCard
            title="Total Materials"
            value={materials}
            color="primary"
          />
        </div>

        <div className="col-md-3">
          <DashboardCard
            title="Total Stock"
            value={totalStock}
            color="info"
          />
        </div>

        <div className="col-md-3">
          <DashboardCard
            title="Today Stock In"
            value={todayIn}
            color="success"
          />
        </div>

        <div className="col-md-3">
          <DashboardCard
            title="Today Stock Out"
            value={todayOut}
            color="danger"
          />
        </div>

      </div>

      {/* ✅ ALERT TABLES */}
      <div className="row mt-4">

        {/* LOW STOCK */}
        <div className="col-md-6">

          <div className="card dashboard-table">
            <div className="card-body">

              <h5 className="low-stock-title">Low Stock Warning</h5>

              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Available</th>
                  </tr>
                </thead>

                <tbody>
                  {lowStock.length > 0 ? (
                    lowStock.map((item, i) => (
                      <tr key={i}>
                        <td>{item.materialName}</td>
                        <td className="danger-text">{item.currentStock}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">No Low Stock</td>
                    </tr>
                  )}
                </tbody>

              </table>

            </div>
          </div>

        </div>

        {/* OUT OF STOCK */}
        <div className="col-md-6">

          <div className="card dashboard-table">
            <div className="card-body">

              <h5 className="out-stock-title">Out Of Stock Items</h5>

              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {outStock.length > 0 ? (
                    outStock.map((item, i) => (
                      <tr key={i}>
                        <td>{item.materialName}</td>
                        <td className="danger-text">Out of Stock</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">No Out Of Stock</td>
                    </tr>
                  )}
                </tbody>

              </table>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;