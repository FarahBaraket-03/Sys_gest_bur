// routes/bur.routes.js
import express from 'express';
import {
  getbureau,
  getBureauById,
  createBureau,
  updateBureau,
  deleteBureau,
  getBureauxGrouped
} from '../controllers/bur.controller.js';

const routerbur = express.Router();

// Get all bureaus
routerbur.get('/', getbureau);

// Get bureaux grouped by niveau
routerbur.get('/grouped', getBureauxGrouped);

// Get bureau by ID
routerbur.get('/:numero', getBureauById);

// Create a new bureau
routerbur.post('/add', createBureau);

// Update a bureau
routerbur.put('/maj', updateBureau);

// Delete a bureau
routerbur.delete('/del/:numero', deleteBureau);



export default routerbur;

