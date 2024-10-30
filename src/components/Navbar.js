import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("settings");
    navigate("/login");
  };

  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <nav className="navbar navbar-expand-lg navbar-absolute navbar-transparent">
      <div className="container-fluid">
        <div className="navbar-wrapper">
          <div className="navbar-toggle">
            <button type="button" className="navbar-toggler">
              <span className="navbar-toggler-bar bar1"></span>
              <span className="navbar-toggler-bar bar2"></span>
              <span className="navbar-toggler-bar bar3"></span>
            </button>
          </div>
          <a className="navbar-brand" href="#pablo">My Dashboard</a>
        </div>
        {isAuthenticated && (
          <button onClick={handleLogout} className="btn btn-danger ml-auto">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
