import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../context/userContext";

function Header() {
  const location = useLocation();
  const {setUser } = useUser()
   const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Test Cases", path: "/testcase" },
    { name: "AI Recommendation", path: "/testairecomandation" }
  ];

  function handleLogout(){
     setUser(null)
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: "#101828", borderBottom: "1px solid #333" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Logo & Title */}
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", color: "#bbb", gap: 1 }}>
          AutoTest <SendIcon sx={{ color: "#888" }} />
        </Typography>

        {/* Navigation Links */}
        <nav style={{ display: "flex", gap: "16px" }}>
          {navLinks.map((link) => (
            <Box key={link.path} sx={{ position: "relative" }}>
              <Button
                color="inherit"
                component={Link}
                to={link.path}
                sx={{
                  color: location.pathname === link.path ? "#fff" : "#bbb",
                  '&:hover': { color: "#fff" },
                  transition: "color 0.3s"
                }}
              >
                {link.name}
              </Button>
            
              {location.pathname === link.path && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    width: "80%",
                    height: "2px",
                    backgroundColor: "#fff",
                    transform: "translateX(-50%)",
                    transition: "width 0.3s"
                  }}
                />
              )}
            </Box>
            
          ))}
            <Button  color="inherit" onClick={handleLogout}>
                 log out
              </Button>
        </nav>
      </Toolbar>
    </AppBar>
  );
}

export default Header;




