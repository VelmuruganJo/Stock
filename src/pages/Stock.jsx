import { useEffect,useState } from "react";
import API from "../api";
import "./style/Stock.css";

function Stock(){

const [stocks,setStocks]=useState([]);

useEffect(()=>{

API.get("/currentstock")
.then(res=>setStocks(res.data || []))
.catch(err=>console.error(err));

},[]);

return(

<div className="stock-page">

<h2>Current Stock</h2>

<table className="stock-table">

<thead>

<tr>
<th>Material</th>
<th>Total In</th>
<th>Total Out</th>
<th>Current</th>
</tr>

</thead>

<tbody>

{stocks.map((s,index)=>(

<tr key={index}>

<td>{s.materialName}</td>
<td>{s.totalIn}</td>
<td>{s.totalOut}</td>
<td>{s.currentStock}</td>

</tr>

))}

</tbody>

</table>

</div>

)

}

export default Stock;