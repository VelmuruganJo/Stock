import { useState, useEffect } from "react";
import API from "../api";
import "./style/common.css";

function Assets() {

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    materialCode: "",
    materialName: "",
    make: "",
    price: "",
    qty: "",
    remarks: ""
  });

  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const grandTotal = filtered.reduce(
  (sum, a) => sum + ((a.price || 0) * (a.qty || 0)),
  0
);

  // 🔥 LOAD
  const loadData = async () => {
    const res = await API.get("/assets");
    setData(res.data || []);
    setFiltered(res.data || []);
  };
  

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, []);

  // 🔍 SEARCH
  useEffect(() => {
    if (search === "") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFiltered(data);
    } else {
      const f = data.filter(d =>
        Object.values(d).some(v =>
          String(v).toLowerCase().includes(search.toLowerCase())
        )
      );
      setFiltered(f);
    }
  }, [search, data]);

  // 📝 HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 💰 AUTO TOTAL
  const totalValue = (form.price || 0) * (form.qty || 0);

  // 💾 SAVE
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      price: parseFloat(form.price),
      qty: parseInt(form.qty)
    };

    if (editId) {
      await API.put(`/assets/${editId}`, payload);
      setEditId(null);
    } else {
      await API.post("/assets", payload);
    }

    resetForm();
    loadData();
  };

  // 🔄 RESET
  const resetForm = () => {
    setForm({
      materialCode: "",
      materialName: "",
      make: "",
      price: "",
      qty: "",
      remarks: ""
    });
    setEditId(null);
    setShowForm(false);
  };

  // ✏️ EDIT
  const editAsset = (a) => {
    setEditId(a.id);
    setShowForm(true);
    setForm({
      materialCode: a.materialCode,
      materialName: a.materialName,
      make: a.make,
      price: a.price,
      qty: a.qty,
      remarks: a.remarks
    });
  };

  // ❌ DELETE
  const deleteAsset = async (id) => {
    await API.delete(`/assets/${id}`);
    loadData();
  };

  return (
    <div className="stock-page">

      <h2>Assets</h2>

      {/* 🔝 TOP BAR */}
      <div className="top-bar">

        <button
          className="stock-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close Form" : "+ Asset"}
        </button>

        <input
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />

      </div>

      {/* 🧾 FORM */}
      {showForm && (
        <form className="stock-form" onSubmit={handleSubmit}>

          <input
            className="form-input"
            name="materialCode"
            placeholder="Material Code"
            value={form.materialCode}
            onChange={handleChange}
            required
          />

          <input
            className="form-input"
            name="materialName"
            placeholder="Material Name"
            value={form.materialName}
            onChange={handleChange}
            required
          />

          <input
            className="form-input"
            name="make"
            placeholder="Make"
            value={form.make}
            onChange={handleChange}
          />

          <input
            className="form-input"
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />

          <input
            className="form-input"
            type="number"
            name="qty"
            placeholder="Qty"
            value={form.qty}
            onChange={handleChange}
            required
          />

          {/* 🔥 AUTO TOTAL */}
          <input
            className="form-input"
            value={`Total: ₹ ${totalValue}`}
            readOnly
          />

          <input
            className="form-input"
            name="remarks"
            placeholder="Remarks"
            value={form.remarks}
            onChange={handleChange}
          />

          <button className="btn-save">
            {editId ? "Update" : "Add"}
          </button>

          <button
            type="button"
            className="btn-cancel"
            onClick={resetForm}
          >
            Cancel
          </button>

        </form>
      )}

      {/* 📊 TABLE */}
      <div className="table-container">

        <table className="stock-table">

          <thead>
            <tr>
              <th>Sl No</th>
              <th>Material Code</th>
              <th>Material Name</th>
              <th>Make</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total Value</th>
              <th>Remarks</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>

            {filtered.length > 0 ? (
              filtered.map((a, i) => (
                <tr key={a.id} onClick={() => editAsset(a)}>

                  <td>{i + 1}</td>

                  <td style={{ cursor: "pointer", color: "#4f46e5", fontWeight: 600 }}>
                    {a.materialCode}
                  </td>

                  <td>{a.materialName}</td>
                  <td>{a.make}</td>
                  <td>₹ {a.price}</td>
                  <td>{a.qty}</td>
                  <td>₹ {a.totalValue}</td>
                  <td>{a.remarks}</td>

                  <td>
                    <button
                      className="btn-cancel"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAsset(a.id);
                      }}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">No Data Found</td>
              </tr>
            )}

          </tbody>
          <tfoot>
  <tr>
    <td colSpan="6" style={{ textAlign: "right", fontWeight: "bold" }}>
      Grand Total
    </td>
    <td style={{ fontWeight: "bold", color: "#16a34a" }}>
      ₹ {Number(grandTotal).toLocaleString("en-IN")}
    </td>
    <td colSpan="2"></td>
  </tr>
</tfoot>

        </table>

      </div>

    </div>
  );
}

export default Assets;