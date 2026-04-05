import { useState, useEffect } from "react";
import API from "../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./style/common.css";

function VeoliaMaterial() {

  const [materialCode, setMaterialCode] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");

  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);

  const [editCode, setEditCode] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const formatPrice = (value) => {
  if (!value && value !== 0) return "";
  return Number(value).toFixed(2);
};

  // ✅ CSV FILE STATE
  const [file, setFile] = useState(null);

  // LOAD DATA
  const loadData = async () => {
    try {
      const res = await API.get("/Veoliamaterials");
      setRecords(res.data || []);
    } catch (err) {
      console.error("Load error", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  // SORT
  useEffect(() => {
    const sorted = [...records].sort((a, b) =>
      (a.category || "").localeCompare(b.category || "")
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredRecords(sorted);
  }, [records]);

  // SEARCH
  const handleSearch = (value) => {
    setSearch(value);

    if (value.trim() === "") {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter((r) =>
      Object.values(r).some((val) =>
        String(val).toLowerCase().includes(value.toLowerCase())
      )
    );

    setFilteredRecords(filtered);
  };

  // EXPORT EXCEL
  const exportToExcel = () => {
    const data = filteredRecords.map((r, index) => ({
      "Sl No": index + 1,
      "Material Code": r.materialCode,
      "Description": r.materialName,
      "Category": r.category,
      "Price": r.price
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "VeoliaMaterials");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream"
    });

    saveAs(file, "VeoliaMaterials.xlsx");
  };

  // ✅ CSV UPLOAD FUNCTION
  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await API.post("/Veoliamaterials/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("CSV Uploaded Successfully");
      setFile(null);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Upload Failed");
    }
  };

  // SAVE / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      materialCode,
      materialName,
      category,
      price
    };

    try {
      if (editCode) {
        await API.put("/Veoliamaterials/" + editCode, data);
        setEditCode(null);
      } else {
        await API.post("/Veoliamaterials", data);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving material");
    }

    resetForm();
    loadData();
  };

  // RESET
  const resetForm = () => {
    setMaterialCode("");
    setMaterialName("");
    setCategory("");
    setPrice("");
    setShowForm(false);
    setFile(null);
  };

  // EDIT
  const editMaterial = (r) => {
    setEditCode(r.materialCode);
    setShowForm(true);

    setMaterialCode(r.materialCode || "");
    setMaterialName(r.materialName || "");
    setCategory(r.category || "");
    setPrice(r.price || "");
  };

  // DELETE
  const deleteMaterial = async (code) => {
    if (!window.confirm("Delete this material?")) return;

    try {
      await API.delete("/Veoliamaterials/" + code);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="stock-page">

      <h2>Veolia Material</h2>

      {/* TOP BAR */}
      <div className="top-bar">

        <button
          className="stock-btn"
          onClick={() => setShowForm(!showForm)}
        >
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

      {/* FORM */}
      {showForm && (
        <form className="stock-form" onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Material Code"
            className="form-input"
            value={materialCode}
            onChange={(e) => setMaterialCode(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Material Name"
            className="form-input"
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Category"
            className="form-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            type="number"
            placeholder="Price"
            className="form-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <button className="btn-save">
            {editCode ? "Update Material" : "Save Material"}
          </button>

          {/* ✅ CSV UPLOAD SECTION */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center",width:"500px" }}>

            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <button
              type="button"
              className="btn-save"
              onClick={handleFileUpload}
              disabled={!file}
            >
              Upload CSV
            </button>

            {file && <span>{file.name}</span>}

          </div>

        </form>
      )}

      {/* TABLE */}
      <div className="table-container">
        <table className="stock-table">

          <thead>
            <tr>
              <th>Sl No</th>
              <th>Material Code</th>
              <th>Description</th>
              <th>Category</th>
              <th>Price</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((r, index) => (
                <tr key={r.materialCode}>

                  <td>{index + 1}</td>

                  <td
                    onClick={() => editMaterial(r)}
                    style={{
                      color: "blue",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    {r.materialCode}
                  </td>

                  <td>{r.materialName}</td>
                  <td>{r.category}</td>
                  <td>₹ {formatPrice(r.price)}</td>

                  <td>
                    <button
                      className="btn-cancel"
                      onClick={() => deleteMaterial(r.materialCode)}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "red" }}>
                  Material Not Available
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default VeoliaMaterial;