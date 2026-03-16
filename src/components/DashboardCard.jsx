function DashboardCard({title,value}){

  return(

    <div className="card shadow p-3">

      <h6>{title}</h6>
      <h2>{value}</h2>

    </div>

  )

}

export default DashboardCard;