import { useEffect, useState } from "react";
import API from "../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./style/common.css";

function BankStock() {

  const [stocks, setStocks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [currentDate, setCurrentDate] = useState("");

  // 🔥 DATE FORMAT
  useEffect(() => {
    const today = new Date();

    const formatted = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit"
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentDate(formatted);
  }, []);

  // 🔥 LOAD DATA
  useEffect(() => {
    API.get("/combined-materials/class-a")
      .then(res => {
        setStocks(res.data || []);
        setFiltered(res.data || []);
      })
      .catch(err => console.error(err));
  }, []);

  // 🔍 SEARCH
  const handleSearch = (val) => {
    setSearch(val);

    if (val === "") {
      setFiltered(stocks);
      return;
    }

    const f = stocks.filter(s =>
      Object.values(s).some(v =>
        String(v).toLowerCase().includes(val.toLowerCase())
      )
    );

    setFiltered(f);
  };

  // 💰 FORMAT (₹ AUTO)
  const formatCurrency = (value) => {
    return (value ?? 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // 🔥 GRAND TOTAL
  const grandTotal = filtered.reduce(
    (sum, s) => sum + (s.totalValue ?? 0),
    0
  );

  // 📥 EXPORT
  const exportExcel = () => {
    const data = filtered.map((s, i) => ({
      "Sl No": i + 1,
      "Material Code": s.materialCode,
      "Material Name": s.materialName,
      "Price (₹)": formatCurrency(s.price),
      [`Stock (${currentDate})`]: s.currentStock ?? 0,
      "Total Value (₹)": formatCurrency(s.totalValue)
    }));

    // ADD TOTAL ROW
    data.push({
      "Sl No": "",
      "Material Code": "",
      "Material Name": "GRAND TOTAL",
      "Price (₹)": "",
      [`Stock (${currentDate})`]: "",
      "Total Value (₹)": formatCurrency(grandTotal)
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bank Stock");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "BankStock.xlsx");
  };

  return (
    <div className="stock-page">

      <h2>Bank Stock</h2>

      <div className="top-bar">

        <input
          placeholder="Search..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="search-input"
        />

        <button onClick={exportExcel} className="btn-export">
          Export Excel
        </button>

      </div>

      <div className="table-container">

        <table className="stock-table">

          <thead>
            <tr>
              <th>Sl No</th>
              <th>Material Code</th>
              <th>Material Name</th>
              <th>Price</th>
              <th>Stock ({currentDate})</th>
              <th>Total Value</th>
            </tr>
          </thead>

          <tbody>

            {filtered.length > 0 ? (
              filtered.map((s, i) => {

                const isHighValue = (s.totalValue ?? 0) > 100000; // 🔥 threshold

                return (
                  <tr
                    key={i}
                    style={{
                      backgroundColor: isHighValue ? "#dcfce7" : ""
                    }}
                  >
                    <td>{i + 1}</td>
                    <td>{s.materialCode}</td>
                    <td>{s.materialName}</td>
                    <td>₹ {formatCurrency(s.price)}</td>
                    <td>{s.currentStock ?? 0}</td>
                    <td>₹ {formatCurrency(s.totalValue)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "red" }}>
                  No Data Found
                </td>
              </tr>
            )}

            {/* 🔥 GRAND TOTAL ROW */}
            {filtered.length > 0 && (
              <tr style={{ fontWeight: "bold", background: "#facc15" }}>
                <td colSpan="5" style={{ textAlign: "right" }}>
                  GRAND TOTAL
                </td>
                <td>₹ {formatCurrency(grandTotal)}</td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default BankStock;