import { useEffect, useState } from "react";
import API from "../api";
import "./style/common.css";

function PanelOut(){

  const [showForm,setShowForm]=useState(false);

  const [data,setData]=useState([]);
  const [filtered,setFiltered]=useState([]);
  const [search,setSearch]=useState("");

  const [panelSerialNumber,setPanelSerialNumber]=useState("");
  const [invoiceNumber,setInvoiceNumber]=useState("");
  const [customer,setCustomer]=useState("");
  const [value,setValue]=useState("");

  const [editId,setEditId]=useState(null);

  // LOAD DATA
  const load = ()=>{
    API.get("/panel-out").then(res=>{
      setData(res.data || []);
      setFiltered(res.data || []);
    });
  };

  useEffect(()=>{ load(); },[]);

  // SEARCH
  useEffect(()=>{
    if(search===""){
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
  },[search,data]);

  // SAVE / UPDATE
  const save = async ()=>{
    const payload = {
      panelSerialNumber,
      invoiceNumber,
      customer,
      value
    };

    if(editId){
      await API.put(`/panel-out/${editId}`, payload);
    } else {
      await API.post("/panel-out", payload);
    }

    resetForm();
    load();
  };

  const resetForm = ()=>{
    setPanelSerialNumber("");
    setInvoiceNumber("");
    setCustomer("");
    setValue("");
    setEditId(null);
    setShowForm(false);
  };

  // EDIT
  const editRow = (d)=>{
    setEditId(d.id);
    setShowForm(true);

    setPanelSerialNumber(d.panelSerialNumber);
    setInvoiceNumber(d.invoiceNumber);
    setCustomer(d.customer);
    setValue(d.value);
  };

  // DELETE
  const deleteRow = async (id)=>{
    await API.delete(`/panel-out/${id}`);
    load();
  };

  return(
    <div className="stock-page">

      <h2>Panel Out</h2>

      {/* TOP BAR */}
      <div className="top-bar">

        <button className="stock-btn" onClick={()=>setShowForm(!showForm)}>
          {showForm ? "Close Form" : "+ Panel Out"}
        </button>

        <input
          placeholder="Search..."
          value={search}
          onChange={e=>setSearch(e.target.value)}
          className="search-input"
        />

      </div>

      {/* FORM */}
      {showForm && (
        <div className="stock-form">

          <input
            className="form-input"
            placeholder="Panel Serial"
            value={panelSerialNumber}
            onChange={e=>setPanelSerialNumber(e.target.value)}
          />

          <input
            className="form-input"
            placeholder="Invoice"
            value={invoiceNumber}
            onChange={e=>setInvoiceNumber(e.target.value)}
          />

          <input
            className="form-input"
            placeholder="Customer"
            value={customer}
            onChange={e=>setCustomer(e.target.value)}
          />

          <input
            className="form-input"
            placeholder="Value"
            type="number"
            value={value}
            onChange={e=>setValue(e.target.value)}
          />

          <button className="btn-save" onClick={save}>
            {editId ? "Update" : "Save"}
          </button>

          <button className="btn-cancel" onClick={resetForm}>
            Cancel
          </button>

        </div>
      )}

      {/* TABLE */}
      <div className="table-container">
        <table className="stock-table">

          <thead>
            <tr>
              <th>Sl No</th>
              <th>Panel Serial</th>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Value</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((d,i)=>(
                <tr key={d.id} onClick={()=>editRow(d)}>

                  <td>{i+1}</td>

                  <td>
                    {d.panelSerialNumber}
                  </td>

                  <td>{d.invoiceNumber}</td>
                  <td>{d.customer}</td>
                  <td>₹ {d.value}</td>

                  <td>
                    <button
                      className="btn-cancel"
                      onClick={(e)=>{
                        e.stopPropagation();
                        deleteRow(d.id);
                      }}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No Data Found</td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default PanelOut;