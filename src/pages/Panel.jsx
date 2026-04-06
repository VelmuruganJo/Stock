import { useEffect, useState } from "react";
import API from "../api";
import * as XLSX from "xlsx";
import "./style/common.css";

function Panel(){

  const [data,setData]=useState([]);
  const [filtered,setFiltered]=useState([]);
  const [search,setSearch]=useState("");

  const [popup,setPopup]=useState(false);
  const [materials,setMaterials]=useState([]);
  const [selected,setSelected]=useState({});

  const [editRow,setEditRow]=useState(null);

  useEffect(()=>{ loadPanels(); },[]);

  // LOAD + AUTO CALCULATE
  const loadPanels = async () => {
    const res = await API.get("/panel");
    const panels = res.data || [];

    const updated = await Promise.all(
      panels.map(async (p)=>{
        try {
          const res2 = await API.get(
            `/panel/materials?panelNo=${encodeURIComponent(p.panelSerialNumber)}`
          );

          const materials = res2.data || [];

          const total = materials.reduce(
            (s,m)=> s + ((m.qty||0)*(m.price||0)),0
          );

          return { ...p, totalValue: total };

        } catch {
          return { ...p, totalValue: 0 };
        }
      })
    );

    setData(updated);
    setFiltered(updated);
  };

  // SEARCH
  useEffect(()=>{
    const f = data.filter(p =>
      p.panelSerialNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.projectName?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
  },[search,data]);

  // OPEN POPUP
  const openPopup = async (row)=>{
    setSelected(row);
    setPopup(true);

    try {
      const res = await API.get(
        `/panel/materials?panelNo=${encodeURIComponent(row.panelSerialNumber)}`
      );

      const mat = (res.data || []).map(r => ({
        ...r,
        price: r.price || 0,
        total: (r.qty || 0) * (r.price || 0)
      }));

      setMaterials(mat);

    } catch {
      setMaterials([]);
    }
  };

  const closePopup = ()=> setPopup(false);

  // EDIT
  const startEdit = (row)=> setEditRow({...row});

  const saveEdit = async ()=>{
    try {
      await API.post("/panel", editRow);
      setEditRow(null);
      loadPanels();
    } catch {
      alert("Update failed");
    }
  };

  // TOTALS
  const popupTotal = materials.reduce((s,m)=>s+m.total,0);

  const dispatchedTotal = filtered
    .filter(p => p.status === "Dispatched")
    .reduce((s,p)=>s+(p.totalValue||0),0);

  const factoryTotal = filtered
    .filter(p => p.status === "Our Factory")
    .reduce((s,p)=>s+(p.totalValue||0),0);

  const commonTotal = filtered.reduce((s,p)=>s+(p.totalValue||0),0);

  // ✅ EXPORT MAIN TABLE
  const exportMainExcel = () => {
    const sheetData = filtered.map((p, i) => ({
      "Sl No": i + 1,
      "Panel Serial": p.panelSerialNumber,
      "Project": p.projectName,
      "Model": p.model,
      "Status": p.status,
      "Value": p.totalValue || 0
    }));

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Panels");

    XLSX.writeFile(wb, "Panel_List.xlsx");
  };

  // ✅ EXPORT POPUP TABLE
  const exportPopupExcel = () => {
    const sheetData = materials.map((m, i) => ({
      "Sl No": i + 1,
      "Material Code": m.materialCode,
      "Material Name": m.materialName,
      "Qty": m.qty,
      "Price": m.price,
      "Total": m.total
    }));

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Materials");

    XLSX.writeFile(wb, `Panel_${selected.panelSerialNumber}.xlsx`);
  };

  return(
    <div className="stock-page">

      <h2>Panel List</h2>

      <div className="top-bar">
        <input
          placeholder="Search Panel / Project..."
          className="form-input"
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />

        {/* ✅ EXPORT BUTTON */}
        <button className="btn-export" onClick={exportMainExcel}>
          Export Excel
        </button>
      </div>

      <div className="table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Sl No</th>
              <th>Panel Serial</th>
              <th>Project</th>
              <th>Model</th>
              <th>Status</th>
              <th>Value</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p,i)=>{
              const isEdit = editRow && editRow.panelSerialNumber === p.panelSerialNumber;

              return(
                <tr key={i}>
                  <td>{i+1}</td>

                  <td
                    style={{cursor:"pointer", color:"#4f46e5", fontWeight:"600"}}
                    onClick={()=>openPopup(p)}
                  >
                    {p.panelSerialNumber}
                  </td>

                  <td>
                    {isEdit ? (
                      <input
                        className="form-input"
                        value={editRow.projectName || ""}
                        onChange={e=>setEditRow({...editRow, projectName:e.target.value})}
                      />
                    ) : p.projectName}
                  </td>

                  <td>
                    {isEdit ? (
                      <input
                        className="form-input"
                        value={editRow.model || ""}
                        onChange={e=>setEditRow({...editRow, model:e.target.value})}
                      />
                    ) : p.model}
                  </td>

                  <td>{p.status}</td>

                  <td>
                    ₹ {Number(p.totalValue || 0).toLocaleString("en-IN")}
                  </td>

                  <td>
                    {isEdit ? (
                      <>
                        <button className="btn-save" onClick={saveEdit}>Save</button>
                        <button className="btn-cancel" onClick={()=>setEditRow(null)}>Cancel</button>
                      </>
                    ) : (
                      <button className="stock-btn" onClick={()=>startEdit(p)}>Edit</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan="5" style={{textAlign:"right", fontWeight:"bold"}}>Dispatched Total</td>
              <td style={{fontWeight:"bold", color:"#ef4444"}}>
                ₹ {Number(dispatchedTotal).toLocaleString("en-IN")}
              </td>
              <td></td>
            </tr>

            <tr>
              <td colSpan="5" style={{textAlign:"right", fontWeight:"bold"}}>Our Factory Total</td>
              <td style={{fontWeight:"bold", color:"#16a34a"}}>
                ₹ {Number(factoryTotal).toLocaleString("en-IN")}
              </td>
              <td></td>
            </tr>

            <tr>
              <td colSpan="5" style={{textAlign:"right", fontWeight:"bold"}}>Grand Total</td>
              <td style={{fontWeight:"bold", color:"#4f46e5"}}>
                ₹ {Number(commonTotal).toLocaleString("en-IN")}
              </td>
              <td></td>
            </tr>
          </tfoot>

        </table>
      </div>

      {/* POPUP */}
      {popup && (
        <div className="modal-overlay" onClick={closePopup}>
          <div className="modal-1" onClick={e=>e.stopPropagation()}>

            <div className="modal-header">
              <h3>Panel : {selected.panelSerialNumber}</h3>
            </div>

            <div className="modal-body">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Material Code</th>
                    <th>Name</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {materials.map((m,i)=>(
                    <tr key={i}>
                      <td>{m.materialCode}</td>
                      <td>{m.materialName}</td>
                      <td>{m.qty}</td>
                      <td>₹ {Number(m.price).toLocaleString("en-IN")}</td>
                      <td>₹ {Number(m.total).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="total-box">
                Grand Total: ₹ {Number(popupTotal).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-export" onClick={exportPopupExcel}>
                Export Excel
              </button>

              <button className="btn-cancel" onClick={closePopup}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Panel;