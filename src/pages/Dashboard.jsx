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

  const [normalValue, setNormalValue] = useState(0);
  const [veoliaValue, setVeoliaValue] = useState(0);
  const [bankValue, setBankValue] = useState(0);

  const [assetsValue, setAssetsValue] = useState(0);              // 🆕
  const [factoryPanelValue, setFactoryPanelValue] = useState(0);  // 🆕

  const [lowStock, setLowStock] = useState([]);
  const [outStock, setOutStock] = useState([]);
  const [totalStockValue, setTotalStockValue] = useState(0);

  const loadDashboard = async () => {
    try {

      // 🚀 ALL API CALLS
      const [
        stockRes,
        veoliaRes,
        bankRes,
        assetsRes,
        panelRes
      ] = await Promise.all([
        API.get("/currentstock"),
        API.get("/veolia-stock"),
        API.get("/combined-materials/class-a"),
        API.get("/assets"),     // 🆕
        API.get("/panel")       // 🆕
      ]);

      const stock = stockRes.data || [];
      const veolia = veoliaRes.data || [];
      const bank = bankRes.data || [];
      const assets = assetsRes.data || [];
      const panels = panelRes.data || [];

      // 💰 NORMAL STOCK
      const normalTotal = stock.reduce(
        (sum, s) => sum + (s.totalValue || 0),
        0
      );
      setNormalValue(normalTotal);

      // 💰 VEOLIA
      const veoliaTotal = veolia.reduce(
        (sum, s) => sum + (s.totalValue || 0),
        0
      );
      setVeoliaValue(veoliaTotal);

      // 💰 BANK
      const bankTotal = bank.reduce(
        (sum, s) => sum + (s.totalValue || 0),
        0
      );
      setBankValue(bankTotal);

      // 💰 ASSETS VALUE
      const assetsTotal = assets.reduce(
        (sum, a) => sum + ((a.price || 0) * (a.qty || 0)),
        0
      );
      const total = normalTotal + veoliaTotal;
setTotalStockValue(total);
      setAssetsValue(assetsTotal);

      // 💰 OUR FACTORY PANELS VALUE
      const factoryPanels = panels.filter(
        p => p.status === "Our Factory"
      );

      // 🔥 If totalValue exists
      let factoryTotal = factoryPanels.reduce(
        (sum, p) => sum + (p.totalValue || 0),
        0
      );

      // 🔥 If totalValue NOT available → calculate from materials API
      if (factoryTotal === 0 && factoryPanels.length > 0) {
        const totals = await Promise.all(
          factoryPanels.map(async (p) => {
            try {
              const res = await API.get(
                `/panel/materials?panelNo=${encodeURIComponent(p.panelSerialNumber)}`
              );

              return (res.data || []).reduce(
                (s, m) => s + ((m.qty || 0) * (m.price || 0)),
                0
              );
            } catch {
              return 0;
            }
          })
        );

        factoryTotal = totals.reduce((a, b) => a + b, 0);
      }

      setFactoryPanelValue(factoryTotal);

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

        <div className="col-md-4">
          <DashboardCard
            title="Normal Stock Value"
            value={`₹ ${normalValue.toLocaleString("en-IN")}`}
            color="primary"
          />
        </div>

        <div className="col-md-4">
          <DashboardCard
            title="Veolia Stock Value"
            value={`₹ ${veoliaValue.toLocaleString("en-IN")}`}
            color="success"
          />
        </div>

        <div className="col-md-4">
          <DashboardCard
            title="Bank Stock Value"
            value={`₹ ${bankValue.toLocaleString("en-IN")}`}
            color="warning"
          />
        </div>

        {/* 🆕 ASSETS */}
        <div className="col-md-4">
          <DashboardCard
            title="Assets Value"
            value={`₹ ${assetsValue.toLocaleString("en-IN")}`}
            color="info"
          />
        </div>

        {/* 🆕 FACTORY PANELS */}
        <div className="col-md-4">
          <DashboardCard
            title="Our Factory Panels Value"
            value={`₹ ${factoryPanelValue.toLocaleString("en-IN")}`}
            color="secondary"
          />
        </div>
        <div className="col-md-4">
  <DashboardCard
    title="Total Stock Value"
    value={`₹ ${totalStockValue.toLocaleString("en-IN")}`}
    color="dark"
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
                        <td className="danger-text">
                          {item.currentStock}
                        </td>
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