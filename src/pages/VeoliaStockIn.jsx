import { useState, useEffect } from "react";
import API from "../api";
import "./style/common.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function VeoliaStockIn() {

  const [showForm, setShowForm] = useState(false);

  const [date, setDate] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [materialCode, setMaterialCode] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");

  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  const loadStock = async () => {
    const res = await API.get("/Veoliastockin");
    setRecords(res.data || []);
    setFiltered(res.data || []);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadStock(); }, []);

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

  // EXPORT EXCEL
  const exportExcel = () => {
    const data = filtered.map((r, i) => ({
      "Sl No": i + 1,
      "Date": r.date,
      "PO No": r.poNumber,
      "Invoice No": r.invoiceNumber,
      "Material Code": r.materialCode,
      "Description": r.materialName,
      "Price": r.price,
      "Qty": r.qty
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "VeoliaStockIn");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "VeoliaStockIn.xlsx");
  };

  // SEARCH MATERIAL
  const searchMaterial = async () => {
    try {
      const res = await API.get(`/Veoliamaterials/search/${materialCode}`);
      const d = res.data || {};

      setMaterialName(d.materialName || "");
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
      poNumber,
      invoiceNumber,
      materialCode,
      materialName,
      price,
      qty
    };

    if (editId) {
      await API.put(`/Veoliastockin/${editId}`, data);
      setEditId(null);
    } else {
      await API.post("/Veoliastockin", data);
    }

    resetForm();
    loadStock();
  };

  // RESET
  const resetForm = () => {
    setDate("");
    setPoNumber("");
    setInvoiceNumber("");
    setMaterialCode("");
    setMaterialName("");
    setPrice("");
    setQty("");
    setEditId(null);
    setShowForm(false);
  };

  // EDIT
  const editStock = (r) => {
    setEditId(r.id);
    setShowForm(true);

    setDate(r.date || "");
    setPoNumber(r.poNumber || "");
    setInvoiceNumber(r.invoiceNumber || "");
    setMaterialCode(r.materialCode || "");
    setMaterialName(r.materialName || "");
    setPrice(r.price || "");
    setQty(r.qty || "");
  };

  // DELETE
  const deleteStock = async (id) => {
    await API.delete(`/Veoliastockin/${id}`);
    loadStock();
  };

  return (
    <div className="stock-page">

      <h2>Veolia In</h2>

      <div className="top-bar">

        <button className="stock-btn" onClick={() => setShowForm(!showForm)}>
           {showForm ? "Close Form" :"Veolia In"}
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
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <input className="form-input" type="number" placeholder="PO Number"
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
            required
          />

          <input className="form-input" type="number" placeholder="Invoice Number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            required
          />

          <input className="form-input" type="text" placeholder="Material Code"
            value={materialCode}
            onChange={(e) => setMaterialCode(e.target.value)}
          />

          <button type="button" className="stock-btn" onClick={searchMaterial}>
            Search
          </button>

          <input className="form-input" type="text"
            value={materialName}
            readOnly
          />

          <input className="form-input" type="number"
            value={price}
            readOnly
          />

          <input className="form-input" type="number" placeholder="Qty"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            required
          />

          <button className="btn-save">
            {editId ? "Update" : "Add"}
          </button>

          {/* <button type="button" className="btn-cancel" onClick={resetForm}>
            Cancel
          </button> */}

        </form>
      )}

      <div className="table-container">
        <table className="stock-table">

          <thead>
            <tr>
              <th>Sl No</th>
              <th>Date</th>
              <th>PO No</th>
              <th>Invoice No</th>
              <th>Material Code</th>
              <th>Description</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id} onClick={() => editStock(r)} >

                <td>{i + 1}</td>
                <td>{r.date}</td>

                <td
                  // onClick={() => editStock(r)}
                  // style={{ color: "blue", cursor: "pointer", fontWeight: "bold" }}
                >
                  {r.poNumber}
                </td>

                <td>{r.invoiceNumber}</td>
                <td>{r.materialCode}</td>
                <td>{r.materialName}</td>
                <td>₹ {r.price?.toFixed(2)}</td>
                <td>{r.qty}</td>

                <td>
                  <button
                      className="btn-cancel"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStock(r.id);
                      }}
                    >
                      Delete
                    </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default VeoliaStockIn;