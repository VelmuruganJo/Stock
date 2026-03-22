import "./style/Header.css";

function Header(){

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location = "/login";
  };

  const username = "Admin"; // later you can get from JWT / backend

  return(
    <header className="app-header">

      <div className="header-left">
        <h1 className="logo">
          Ozone Technologies & Systems (India) Pvt Ltd
        </h1>
      </div>

      <div className="header-right">

        {/* USER INFO */}
        <div className="user-info">
          <div className="avatar">{username.charAt(0)}</div>
          <span>{username}</span>
        </div>

        {/* LOGOUT */}
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>

      </div>

    </header>
  );
}

export default Header;