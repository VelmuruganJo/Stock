import "./style/Header.css";

function Header(){
    const logout = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  window.location = "/login";
};

return(

<header className="app-header">

<h1 className="logo">Ozone Technologies & Systems (India) Pvt Ltd</h1>

<div className="logout-area"><button
className="logout-btn"
onClick={logout}
>
Logout
</button></div>

</header>

);

}

export default Header;