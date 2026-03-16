import "./style/Dashboard.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { month: "Jan", amount: 12000 },
  { month: "Feb", amount: 18000 },
  { month: "Mar", amount: 15000 },
  { month: "Apr", amount: 22000 },
  { month: "May", amount: 26000 }
];

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
  return (
    <div className="stock-page">

      <h3 className="dashboard-title">Inventory Dashboard</h3>

      {/* KPI CARDS */}
      <div className="row g-3">

        <div className="col-md-3">
          <DashboardCard
            title="Monthly Purchase"
            value="₹45,000"
            color="primary"
          />
        </div>

        <div className="col-md-3">
          <DashboardCard
            title="Current Year Purchase"
            value="₹3,20,000"
            color="info"
          />
        </div>

        <div className="col-md-3">
          <DashboardCard
            title="Stock In Yesterday"
            value="120 Items"
            color="success"
          />
        </div>

        <div className="col-md-3">
          <DashboardCard
            title="Stock Out Yesterday"
            value="85 Items"
            color="danger"
          />
        </div>

      </div>

      {/* CHART */}
      <div className="card chart-card">

        <div className="card-body">

          <h5 className="chart-title">Monthly Purchase Trend</h5>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" />
            </BarChart>
          </ResponsiveContainer>

        </div>

      </div>


      {/* ALERT TABLES */}

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
                    <th>Minimum</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Steel Rod</td>
                    <td className="danger-text">8</td>
                    <td>20</td>
                  </tr>

                  <tr>
                    <td>Copper Wire</td>
                    <td className="danger-text">5</td>
                    <td>15</td>
                  </tr>
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

                  <tr>
                    <td>Aluminium Sheet</td>
                    <td className="danger-text">Out of Stock</td>
                  </tr>

                  <tr>
                    <td>Plastic Pipe</td>
                    <td className="danger-text">Out of Stock</td>
                  </tr>

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