import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal, Box, Snackbar, Alert } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { IconButton } from "@mui/material";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { Edit, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "./User.css";
import config from "../../config.json";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  const handleClose = () => {
    setSelectedUser("");
    setError("");
    setModalOpen(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    console.log(token);
    try {
      const response = await axios.get(`${config.local_url}users`, {
        headers: { "access-token": token },
      });
      setUsers(response.data);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch users");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select an Excel file.");
      setTimeout(() => {
        setError("");
      }, 900);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${config.local_url}users/files/upload-users`,
        formData,
        {
          headers: {
            "access-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setError("");
      setOpen(true);
      window.location.reload();
    } catch (err) {
      console.log(err);
      setError(err?.response?.data?.message || "Something went wrong!");
      setOpen(true);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (user) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${config.local_url}users/${user._id}`, {
        headers: { "access-token": token },
      });
      fetchUsers();
    } catch (error) {
      setError(error.response.data?.message || "Error while deleting user");
    }
  };

  const handleSave = async () => {
    try {
      const requiredFields = [
        "first_name",
        "last_name",
        "role",
        "email",
        "dob",
        "gender",
        "mobile",
        "city",
        "state",
      ];
      const missingFields = requiredFields.filter(
        (field) => !selectedUser[field]?.trim()
      );

      if (selectedUser.mobile.length !== 10) {
        setError(`Mobile no should be in 10 digits`);
        setOpen(true);
        return;
      }

      if (missingFields.length > 0) {
        setError(`${missingFields.join(", ")} is missing;`);
        setOpen(true);
        return;
      }
      const token = localStorage.getItem("token");
      await axios.put(
        `${config.local_url}users/${selectedUser._id}`,
        selectedUser,
        {
          headers: { "access-token": token },
        }
      );
      setUsers(
        users.map((u) => (u._id === selectedUser._id ? selectedUser : u))
      );
      handleClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update user");
      setOpen(true);
    }
  };

  const handleChange = (e) => {
    setSelectedUser({ ...selectedUser, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const handleExport = async () => {
    try {
      const response = await axios.get(
        `${config.local_url}/files/export-users`,
        {
          headers: {
            "access-token": localStorage.getItem("token"),
          },
          responseType: "blob",
        }
      );

      console.log(response.data);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      setError("Failed to export users");
    }
  };

  return (
    <div className="mainDiv">
      <div className="pageHeader">
        <Typography variant="h6" component="h2">
          Users List
        </Typography>
        <Button variant="contained" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <div className="inputDiv">
        <div>
          <input
            className="file-upload"
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
          />
          <Button
            sx={{
              marginTop: { xs: "20px", md: "0px" },
              width: { xs: "50%", md: "inherit" },
            }}
            variant="contained"
            onClick={handleImport}
          >
            Upload
          </Button>
          <Snackbar
            open={open}
            autoHideDuration={2000}
            onClose={() => setOpen(false)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={() => setOpen(false)}
              severity="error"
              variant="filled"
            >
              {error}
            </Alert>
          </Snackbar>
        </div>
        {users.length > 0 ? (
          <Button
            sx={{ marginTop: { xs: "20px", md: "0px" } }}
            variant="contained"
            onClick={handleExport}
          >
            Export Users
          </Button>
        ) : (
          <></>
        )}
      </div>
      {error && !modalOpen && <p style={{ color: "red" }}>{error}</p>}

      <TableContainer
        component={Paper}
        sx={{
          width: "80%",
          margin: "auto",
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>First Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Last Name
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Role
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                DOB
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Gender
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Email
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Mobile
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                City
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                State
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user._id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{user.first_name}</TableCell>
                <TableCell align="center">{user.last_name}</TableCell>
                <TableCell align="center">{user.role}</TableCell>
                <TableCell align="center">{user.dob}</TableCell>
                <TableCell align="center">{user.gender}</TableCell>
                <TableCell align="center">{user.email}</TableCell>
                <TableCell align="center">{user.mobile}</TableCell>
                <TableCell align="center">{user.city}</TableCell>
                <TableCell align="center">{user.state}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleEdit(user)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal
        open={modalOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            sx={{ mb: 2 }}
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            Edit User
          </Typography>
          {selectedUser && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto auto",
                gap: "12px",
              }}
            >
              <TextField
                required
                label="First Name"
                name="first_name"
                value={selectedUser.first_name}
                onChange={handleChange}
                sx={{ "& .MuiInputBase-input": { padding: "10px" } }}
              />
              <TextField
                required
                label="Last Name"
                name="last_name"
                value={selectedUser.last_name}
                onChange={handleChange}
                sx={{ "& .MuiInputBase-input": { padding: "10px" } }}
              />
              <TextField
                required
                label="Role"
                name="role"
                value={selectedUser.role}
                onChange={handleChange}
                sx={{ "& .MuiInputBase-input": { padding: "10px" } }}
              />
              <TextField
                required
                label="Email"
                name="email"
                value={selectedUser.email}
                onChange={handleChange}
                sx={{ "& .MuiInputBase-input": { padding: "10px" } }}
              />
              <TextField
                required
                label="DOB"
                name="dob"
                value={selectedUser.dob}
                onChange={handleChange}
                sx={{ "& .MuiInputBase-input": { padding: "10px" } }}
              />
              <TextField
                required
                label="Gender"
                name="gender"
                value={selectedUser.gender}
                onChange={handleChange}
                sx={{ "& .MuiInputBase-input": { padding: "10px" } }}
              />
              <TextField
                required
                label="Mobile"
                name="mobile"
                value={selectedUser.mobile}
                onChange={handleChange}
                sx={{ "& .MuiInputBase-input": { padding: "10px" } }}
              />
              <TextField
                required
                label="City"
                name="city"
                value={selectedUser.city}
                onChange={handleChange}
                sx={{ "& .MuiInputBase-input": { padding: "10px" } }}
              />
              <TextField
                required
                label="State"
                name="state"
                value={selectedUser.state}
                onChange={handleChange}
                sx={{ "& .MuiInputBase-input": { padding: "10px" } }}
              />
              <Button variant="contained" color="primary" onClick={handleSave}>
                Save
              </Button>
            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default UserManagement;
