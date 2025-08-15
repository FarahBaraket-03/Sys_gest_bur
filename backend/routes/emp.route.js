// routes/emp.routes.js
import express from "express";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from "../controllers/emp.controller.js";

const routeremp = express.Router();

// Get all employees
routeremp.get("/", getEmployees);

// Get employee by ID
routeremp.get("/:id", getEmployeeById);

// Create a new employee
routeremp.post("/add", createEmployee);

// Update an employee
routeremp.put("/maj", updateEmployee);

// Delete an employee
routeremp.delete("/del/:matricule", deleteEmployee);

export default routeremp;
