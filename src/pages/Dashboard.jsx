import { useEffect, useState } from "react";
import API from "../api";
import "./style/Dashboard.css";

// ✅ FIX: Added valueClass prop
function DashboardCard({ title, value, color, valueClass }) {
  return (
    <div className={`erp-card ${color}`}>
      <div className="erp-card-body">
        <h6>{title}</h6>
        <h3 className={valueClass}>{value}</h3>
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
  const [totalStockOverall, setTotalStockOverall] = useState(0);
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

      const normalTotal = stock.reduce((s, i) => s + Number(i.totalValue || 0), 0);
      const veoliaTotal = veolia.reduce((s, i) => s + Number(i.totalValue || 0), 0);
      const bankTotal = bank.reduce((s, i) => s + Number(i.totalValue || 0), 0);

      const assetsTotal = assets.reduce(
        (s, a) => s + Number(a.price || 0) * Number(a.qty || 0),
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
        (s, p) => s + Number(p.totalValue || 0),
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
                (s, m) => s + Number(m.qty || 0) * Number(m.price || 0),
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
      const overall = normalTotal + veoliaTotal + factoryTotal;
setTotalStockOverall(overall);

      // LOW STOCK
      setLowStock(
        stock.filter(s => {
          const current = Number(s.currentStock || 0);
          const min = Number(s.minStock || 0);
          return current > 0 && current <= min;
        })
      );

      // OUT OF STOCK
      setOutStock(
        stock.filter(s => Number(s.currentStock || 0) === 0)
      );

    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="stock-page">
      <div className="erp-dashboard-page">
        <h3 className="erp-dashboard-title">Inventory Dashboard</h3>

        <div className="row g-3">

          <div className="col-md-3">
            <DashboardCard 
              title="OTSIL Stock" 
              value={`₹ ${Math.round(normalValue).toLocaleString("en-IN")}`} 
              color="erp-bg-primary"
              valueClass="value_c"
            />
          </div>

          <div className="col-md-3">
            <DashboardCard 
              title="Veolia Stock" 
              value={`₹ ${Math.round(veoliaValue).toLocaleString("en-IN")}`} 
              color="erp-bg-teal"
              valueClass="value_c"
            />
          </div>

          <div className="col-md-3">
            <DashboardCard 
              title="Bank Stock" 
              value={`₹ ${Math.round(bankValue).toLocaleString("en-IN")}`} 
              color="erp-bg-warning"
              valueClass="value_c"
            />
          </div>

          <div className="col-md-3">
            <DashboardCard 
              title="Assets" 
              value={`₹ ${Math.round(assetsValue).toLocaleString("en-IN")}`} 
              color="erp-bg-purple"
              valueClass="value_c"
            />
          </div>

          <div className="col-md-3">
            <DashboardCard 
              title="Production Stock" 
              value={`₹ ${Math.round(factoryPanelValue).toLocaleString("en-IN")}`} 
              color="erp-bg-indigo"
              valueClass="value_c"
            />
          </div>

          <div className="col-md-3">
            <DashboardCard 
              title="Total Stock in Store" 
              value={`₹ ${Math.round(totalStockValue).toLocaleString("en-IN")}`} 
              color="erp-bg-dark"
              valueClass="value_c"
            />
          </div>

          <div className="col-md-3">
            <DashboardCard 
  title="Total Stock Overall" 
  value={`₹ ${Math.round(totalStockOverall).toLocaleString("en-IN")}`} 
  color="erp-bg-dark"
  valueClass="value_c"
/>
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