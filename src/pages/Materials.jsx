import { useState, useEffect } from "react";
import API from "../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./style/common.css";

function Materials() {

  const [form, setForm] = useState({
    materialCode: "",
    materialName: "",
    make: "",
    vendor: "",
    category: "",
    price: "",
    uom: "",
    minStock: "",
    reorderQty: ""
  });

  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);

  const [editCode, setEditCode] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  // LOAD
  const loadData = async () => {
    try {
      const res = await API.get("/materials");
      const data = res.data || [];

      const sorted = [...data].sort((a, b) =>
        (a.category || "").localeCompare(b.category || "")
      );

      setRecords(sorted);
      setFilteredRecords(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadData(); }, []);

  // SEARCH
  const handleSearch = (value) => {
    setSearch(value);

    if (value.trim() === "") {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter(r =>
      Object.values(r).some(val =>
        String(val ?? "").toLowerCase().includes(value.toLowerCase())
      )
    );

    setFilteredRecords(filtered);
  };

  // EXPORT
  const exportToExcel = () => {
    const data = filteredRecords.map((r, index) => ({
      "Sl No": index + 1,
      "Material Code": r.materialCode,
      "Material Name": r.materialName, // ✅ FIXED
      "Make": r.make,
      "Vendor": r.vendor,
      "Category": r.category,
      "UOM": r.uom,
      "Min Stock": r.minStock,
      "Reorder Qty": r.reorderQty,
      "Price": r.price
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Materials");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "Materials.xlsx");
  };

  // INPUT HANDLER
  const handleChange = (e) => {
    setForm({ ...form, [e.target.placeholder.replace(" ", "").toLowerCase()]: e.target.value });
  };

  // SAVE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editCode) {
        await API.put("/materials/" + editCode, form);
        setEditCode(null);
      } else {
        await API.post("/materials", form);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving");
    }

    resetForm();
    loadData();
  };

  // RESET
  const resetForm = () => {
    setForm({
      materialCode: "",
      materialName: "",
      make: "",
      vendor: "",
      category: "",
      price: "",
      uom: "",
      minStock: "",
      reorderQty: ""
    });
    setShowForm(false);
  };

  // EDIT
  const editMaterial = (r) => {
    setEditCode(r.materialCode);
    setShowForm(true);
    setForm({ ...r });
  };

  // DELETE
  const deleteMaterial = async (code, e) => {
    e.stopPropagation(); // ✅ FIXED (prevents row click)
    if (!window.confirm("Delete?")) return;

    await API.delete("/materials/" + code);
    loadData();
  };

  return (
    <div className="stock-page">

      <h2>Material List</h2>

      <div className="top-bar">

        <button className="stock-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close Form" : "Add Material"}
        </button>

        <input
          type="text"
          placeholder="Search Material..."
          className="search-input"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <button className="btn-export" onClick={exportToExcel}>
          Export Excel
        </button>

      </div>

      {showForm && (
        <form className="stock-form" onSubmit={handleSubmit}>

          {Object.keys(form).map((key) => (
            <input
              key={key}
              type={key.includes("price") || key.includes("stock") || key.includes("qty") ? "number" : "text"}
              placeholder={key}
              className="form-input"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={key === "materialCode" || key === "materialName" || key === "price"}
            />
          ))}

          <button className="btn-save">
            {editCode ? "Update" : "Save"}
          </button>

        </form>
      )}

      <div className="table-container">
        <table className="stock-table">

          <thead>
            <tr>
              <th>Sl No</th>
              <th>Material Code</th>
              <th>Material Name</th>
              <th>Make</th>
              <th>Vendor</th>
              <th>Category</th>
              <th>UOM</th>
              <th>Min</th>
              <th>Reorder</th>
              <th>Price</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((r, index) => (
                <tr key={r.materialCode} onClick={() => editMaterial(r)}>
                  <td>{index + 1}</td>
                  <td>{r.materialCode}</td>
                  <td>{r.materialName}</td>
                  <td>{r.make}</td>
                  <td>{r.vendor}</td>
                  <td>{r.category}</td>
                  <td>{r.uom}</td>
                  <td>{r.minStock}</td>
                  <td>{r.reorderQty}</td>
                  <td>₹ {Number(r.price || 0).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn-cancel"
                      onClick={(e) => deleteMaterial(r.materialCode, e)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11">Material Not Available</td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default Materials;