import { useEffect, useState } from "react";
import API from "../api";
import * as XLSX from "xlsx";
import "./style/common.css";

function PanelCompare() {

  const [panels, setPanels] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [popup, setPopup] = useState(false);
  const [compare, setCompare] = useState([]);
  const [selected, setSelected] = useState({});

  const [editRow, setEditRow] = useState(null);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    loadPanels();
  }, []);

  // ================= LOAD =================
  const loadPanels = async () => {
    const res = await API.get("/panel");
    const list = res.data || [];

    const updated = await Promise.all(
      list.map(async (p) => {
        try {
          const res2 = await API.get("/panels/compare", {
            params: {
              reference: p.panelSerialNumber,
              model: p.model
            }
          });

          const data = res2.data || [];

          const total = data.reduce(
            (s, r) => s + (r.usedQty || 0) * (r.price || 0),
            0
          );

          return { ...p, totalValue: total };

        } catch {
          return { ...p, totalValue: 0 };
        }
      })
    );

    setPanels(updated);
    setFiltered(updated);
  };

  // ================= SEARCH =================
  useEffect(() => {
    if (!search) setFiltered(panels);
    else {
      const f = panels.filter(r =>
        Object.values(r).some(v =>
          String(v).toLowerCase().includes(search.toLowerCase())
        )
      );
      setFiltered(f);
    }
  }, [search, panels]);

  // ================= POPUP =================
  const openPopup = async (row) => {
    setSelected(row);
    setPopup(true);

    try {
      const res = await API.get("/panels/compare", {
        params: {
          reference: row.panelSerialNumber,
          model: row.model
        }
      });

      const data = res.data || [];
      setCompare(data);

      const total = data.reduce(
        (s, r) => s + (r.usedQty || 0) * (r.price || 0),
        0
      );

      setGrandTotal(total);

    } catch {
      setCompare([]);
      setGrandTotal(0);
    }
  };

  const closePopup = () => setPopup(false);

  // ================= EDIT =================
  const startEdit = (row) => setEditRow({ ...row });

  const saveEdit = async () => {
    try {
      await API.post("/panel", editRow);
      setEditRow(null);
      loadPanels();
    } catch {
      alert("Update failed");
    }
  };

  // ================= DELETE =================
  const deletePanel = async (row) => {
    if (!window.confirm("Delete this panel?")) return;

    try {
      await API.delete(`/panel/${row.id}`);
      loadPanels();
    } catch {
      alert("Delete failed");
    }
  };

  // ================= EXPORT =================
  const exportMainExcel = () => {
    const data = filtered.map((p, i) => ({
      "Sl No": i + 1,
      "Panel Serial": p.panelSerialNumber,
      "Project": p.projectName,
      "PO Number": p.poNumber,
      "Model": p.model,
      "Value": p.totalValue || 0
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Panels");
    XLSX.writeFile(wb, "Panel_List.xlsx");
  };

  const exportPopupExcel = () => {
    const data = compare.map((r, i) => {
      let status = !r.inBom ? "NOT IN BOM" : r.used ? "USED" : "MISSING";

      return {
        "Sl No": i + 1,
        "Code": r.materialCode,
        "Name": r.materialName,
        "BOM Qty": r.bomQty,
        "Used Qty": r.usedQty,
        "Price": r.price,
        "Total": (r.usedQty * (r.price || 0)).toFixed(2),
        "Status": status
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Compare");
    XLSX.writeFile(wb, `Panel_${selected.panelSerialNumber}.xlsx`);
  };

  return (
    <div className="stock-page">

      <h2>Panel Compare</h2>

      {/* SEARCH */}
      <div className="top-bar">
        <input
          className="form-input"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="btn-export" onClick={exportMainExcel}>
          Export Excel
        </button>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Sl</th>
              <th>Panel Serial</th>
              <th>Project</th>
              <th>PO</th>
              <th>Model</th>
              <th>Value</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {[...filtered]
              .sort((a, b) => (b.status || "").localeCompare(a.status || ""))
              .map((p,i)=>{
              const isEdit = editRow && editRow.panelSerialNumber === p.panelSerialNumber;

              return (
                <tr key={i}>
                  <td>{i + 1}</td>

                  <td onClick={() => openPopup(p)} style={{ cursor: "pointer", color: "#4f46e5" }}>
                    {p.panelSerialNumber}
                  </td>

                  <td>
                    {isEdit
                      ? <input className="form-input" value={editRow.projectName} onChange={e => setEditRow({ ...editRow, projectName: e.target.value })} />
                      : p.projectName}
                  </td>

                  <td>
                    {isEdit
                      ? <input className="form-input" value={editRow.poNumber} onChange={e => setEditRow({ ...editRow, poNumber: e.target.value })} />
                      : p.poNumber}
                  </td>

                  <td>
                    {isEdit
                      ? <input className="form-input" value={editRow.model} onChange={e => setEditRow({ ...editRow, model: e.target.value })} />
                      : p.model}
                  </td>

                  <td>₹ {Number(p.totalValue || 0).toLocaleString("en-IN")}</td>
                  <td>{p.status}</td>

                  <td>
  {isEdit ? (
    <>
      <button className="btn-icon" onClick={saveEdit}>✔</button>
      <button className="btn-icon" onClick={() => setEditRow(null)}>✖</button>
    </>
  ) : (
    <>
      <button className="btn-icon" onClick={() => startEdit(p)}>✏</button>
    </>
  )}
</td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* POPUP */}
      {popup && (
        <div className="modal-overlay" onClick={closePopup}>
          <div className="modal-1" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header custom-header">
              <div>Panel: {selected.panelSerialNumber} | Model: {selected.model}</div>
              <div>Project: {selected.projectName} | PO: {selected.poNumber}</div>
            </div>

            <div className="modal-body">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>BOM</th>
                    <th>Used</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {compare.map((r, i) => {

                    let bg = !r.inBom
                      ? "#fef9c3"
                      : r.used
                        ? "#dcfce7"
                        : "#fee2e2";

                    let status = !r.inBom
                      ? "⚠ NOT IN BOM"
                      : r.used
                        ? "✔ USED"
                        : "❌ MISSING";

                    return (
                      <tr key={i} style={{ backgroundColor: bg }}>
                        <td>{r.materialCode}</td>
                        <td>{r.materialName}</td>
                        <td>{r.bomQty}</td>
                        <td>{r.usedQty}</td>
                        <td>₹ {r.price}</td>
                        <td>₹ {(r.usedQty * (r.price || 0)).toFixed(2)}</td>
                        <td>{status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="total-box">
                Grand Total: ₹ {grandTotal.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="modal-actions">
              <button  className="btn-export" onClick={exportPopupExcel}>Export Excel</button>
              <button  className="btn-cancel" onClick={closePopup}>Close</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default PanelCompare;