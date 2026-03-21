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

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {

      const mat = await API.get("/materials");
      const stock = await API.get("/currentstock");
      const sin = await API.get("/stockin");
      const sout = await API.get("/stockout");

      // TOTAL MATERIALS
      setMaterials(mat.data.length);

      // TOTAL STOCK
      const total = stock.data.reduce((sum, s) => sum + s.currentStock, 0);
      setTotalStock(total);

      // TODAY DATE
      const today = new Date().toISOString().split("T")[0];

      // TODAY IN
      const todayInData = sin.data.filter(d => d.date === today);
      const inQty = todayInData.reduce((sum, d) => sum + d.qty, 0);
      setTodayIn(inQty);

      // TODAY OUT
      const todayOutData = sout.data.filter(d => d.date === today);
      const outQty = todayOutData.reduce((sum, d) => sum + d.qty, 0);
      setTodayOut(outQty);

      // LOW STOCK (<10)
      const low = stock.data.filter(s => s.currentStock > 0 && s.currentStock < 10);
      setLowStock(low);

      // OUT OF STOCK (=0)
      const out = stock.data.filter(s => s.currentStock === 0);
      setOutStock(out);

    } catch (err) {
      console.error(err);
    }
  };

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