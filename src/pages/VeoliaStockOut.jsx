import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./style/common.css";
import API from "../api";

function VeoliaStockOut() {

  const [showForm, setShowForm] = useState(false);

  const [date, setDate] = useState("");
  const [materialCode, setMaterialCode] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [customer, setCustomer] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");

  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  // LOAD DATA
  const loadStock = async () => {
    const res = await API.get("/Veoliastockout");
    setRecords(res.data || []);
    setFiltered(res.data || []);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadStock(); }, []);

  // SEARCH
  const handleSearch = (val) => {
    setSearch(val);

    if (val === "") {
      setFiltered(records);
      return;
    }

    const f = records.filter(r =>
      Object.values(r).some(v =>
        String(v).toLowerCase().includes(val.toLowerCase())
      )
    );

    setFiltered(f);
  };

  // EXPORT
  const exportExcel = () => {
    const data = filtered.map((r, i) => ({
      "SlNo": i + 1,
      "Date": r.date,
      "Material Code": r.materialCode,
      "Material": r.materialName,
      "Customer": r.customer,
      "Price": r.price,
      "Qty": r.qty
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "VeoliaStockOut");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "VeoliaStockOut.xlsx");
  };

  // SEARCH MATERIAL
  const searchMaterial = async () => {
    try {
      const res = await API.get(`/Veoliamaterials/search/${materialCode}`);
      const d = res.data || {};

      setMaterialName(d.itemName || "");
      setPrice(d.price || "");
    } catch {
      alert("Material Not Found");
    }
  };

  // SAVE / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      date,
      materialCode,
      materialName,
      customer,
      price,
      qty
    };

    try {
      if (editId) {
        await API.put(`/Veoliastockout/${editId}`, data);
        setEditId(null);
      } else {
        await API.post("/Veoliastockout", data);
      }

      alert("Saved successfully");
    } catch (err) {
      console.error(err);

      if (err.response && err.response.status === 400) {
        alert(err.response.data || "Not enough stock!");
      } else {
        alert("Something went wrong!");
      }
    }

    resetForm();
    loadStock();
  };

  // RESET
  const resetForm = () => {
    setDate("");
    setMaterialCode("");
    setMaterialName("");
    setCustomer("");
    setPrice("");
    setQty("");
    setEditId(null);
    setShowForm(false);
  };

  // EDIT (CLICK MATERIAL CODE)
  const editStock = (r) => {
    setEditId(r.id);
    setShowForm(true);

    setDate(r.date || "");
    setMaterialCode(r.materialCode || "");
    setMaterialName(r.materialName || "");
    setCustomer(r.customer || "");
    setPrice(r.price || "");
    setQty(r.qty || "");
  };

  return (
    <div className="stock-page">

      <h2>Veolia Out</h2>

      <div className="top-bar">
        <button className="stock-btn" onClick={() => setShowForm(!showForm)}>
          Veolia Out
        </button>

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

      {showForm && (
        <form className="stock-form" onSubmit={handleSubmit}>

          <input className="form-input" type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)} required />

          <input className="form-input" type="text" placeholder="Material Code"
            value={materialCode}
            onChange={(e) => setMaterialCode(e.target.value)}
          />

          <button type="button" className="stock-btn" onClick={searchMaterial}>
            Search
          </button>

          <input className="form-input" type="text" value={materialName} readOnly />

          <input className="form-input" type="text" placeholder="Customer"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)} />

          <input className="form-input" type="number" value={price} readOnly />

          <input className="form-input" type="number" placeholder="Qty"
            value={qty}
            onChange={(e) => setQty(e.target.value)} required
          />

          <button className="btn-save">
            {editId ? "Update" : "Add"}
          </button>

          <button type="button" className="btn-cancel" onClick={resetForm}>
            Cancel
          </button>

        </form>
      )}

      <div className="table-container">
        <table className="stock-table">

          <thead>
            <tr>
              <th>SlNo</th>
              <th>Date</th>
              <th>Material Code</th>
              <th>Material</th>
              <th>Customer</th>
              <th>Price</th>
              <th>Qty</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id}>

                <td>{i + 1}</td>
                <td>{r.date}</td>

                <td
                  onClick={() => editStock(r)}
                  style={{ color: "blue", cursor: "pointer", fontWeight: "bold" }}
                >
                  {r.materialCode}
                </td>

                <td>{r.materialName}</td>
                <td>{r.customer}</td>
                <td>{r.price}</td>
                <td>{r.qty}</td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default VeoliaStockOut;