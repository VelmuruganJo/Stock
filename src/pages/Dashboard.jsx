import { useEffect, useState } from "react";
import API from "../api";
import "./style/Dashboard.css";

function DashboardCard({ title, value, color }) {
  return (
    <div className={`erp-card ${color}`}>
      <div className="erp-card-body">
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
  const [assetsValue, setAssetsValue] = useState(0);
  const [factoryPanelValue, setFactoryPanelValue] = useState(0);
  const [totalStockValue, setTotalStockValue] = useState(0);

  const [lowStock, setLowStock] = useState([]);
  const [outStock, setOutStock] = useState([]);

  const loadDashboard = async () => {
    try {
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
        API.get("/assets"),
        API.get("/panel")
      ]);

      const stock = stockRes.data || [];
      const veolia = veoliaRes.data || [];
      const bank = bankRes.data || [];
      const assets = assetsRes.data || [];
      const panels = panelRes.data || [];

      const normalTotal = stock.reduce((s, i) => s + (i.totalValue || 0), 0);
      const veoliaTotal = veolia.reduce((s, i) => s + (i.totalValue || 0), 0);
      const bankTotal = bank.reduce((s, i) => s + (i.totalValue || 0), 0);

      const assetsTotal = assets.reduce(
        (s, a) => s + (a.price || 0) * (a.qty || 0),
        0
      );

      const total = normalTotal + veoliaTotal;

      setNormalValue(normalTotal);
      setVeoliaValue(veoliaTotal);
      setBankValue(bankTotal);
      setAssetsValue(assetsTotal);
      setTotalStockValue(total);

      const factoryPanels = panels.filter(p => p.status === "Our Factory");

      let factoryTotal = factoryPanels.reduce(
        (s, p) => s + (p.totalValue || 0),
        0
      );

      if (factoryTotal === 0 && factoryPanels.length > 0) {
        const totals = await Promise.all(
          factoryPanels.map(async (p) => {
            try {
              const res = await API.get(
                `/panel/materials?panelNo=${encodeURIComponent(p.panelSerialNumber)}`
              );
              return (res.data || []).reduce(
                (s, m) => s + (m.qty || 0) * (m.price || 0),
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

      setLowStock(
        stock.filter(s => (s.currentStock || 0) > 0 && (s.currentStock || 0) < 10)
      );

      setOutStock(
        stock.filter(s => (s.currentStock || 0) === 0)
      );

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
  }, []);

  return (
    <div className="stock-page">
    <div className="erp-dashboard-page">
      <h3 className="erp-dashboard-title">Inventory Dashboard</h3>

      <div className="row g-3">

        <div className="col-md-3">
          <DashboardCard title="Normal Stock Value" value={`₹ ${normalValue.toLocaleString("en-IN")}`} color="erp-bg-primary" />
        </div>

        <div className="col-md-3">
          <DashboardCard title="Veolia Stock Value" value={`₹ ${veoliaValue.toLocaleString("en-IN")}`} color="erp-bg-teal" />
        </div>

        <div className="col-md-3">
          <DashboardCard title="Bank Stock Value" value={`₹ ${bankValue.toLocaleString("en-IN")}`} color="erp-bg-warning" />
        </div>

        <div className="col-md-3">
          <DashboardCard title="Assets Value" value={`₹ ${assetsValue.toLocaleString("en-IN")}`} color="erp-bg-purple" />
        </div>

        <div className="col-md-3">
          <DashboardCard title="Panels Value" value={`₹ ${factoryPanelValue.toLocaleString("en-IN")}`} color="erp-bg-indigo" />
        </div>

        <div className="col-md-3">
          <DashboardCard title="Total Stock Value" value={`₹ ${totalStockValue.toLocaleString("en-IN")}`} color="erp-bg-dark" />
        </div>

      </div>

      <div className="row mt-4">

        <div className="col-md-6">
          <div className="erp-table-card">
            <div className="erp-card-body">
              <h5 className="erp-table-title-warning">Low Stock Warning</h5>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.length ? lowStock.map((i, idx) => (
                    <tr key={idx}>
                      <td>{i.materialName}</td>
                      <td className="erp-danger-text">{i.currentStock}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="2">No Low Stock</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="erp-table-card">
            <div className="erp-card-body">
              <h5 className="erp-table-title-danger">Out Of Stock Items</h5>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {outStock.length ? outStock.map((i, idx) => (
                    <tr key={idx}>
                      <td>{i.materialName}</td>
                      <td className="erp-danger-text">Out of Stock</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="2">No Out Of Stock</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
    </div>
  );
}

export default Dashboard;