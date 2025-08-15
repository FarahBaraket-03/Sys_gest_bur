import express from 'express';
const routeraff = express.Router();
import {
    getAllAffectations,
    addAffectation,
    updateAffectation,
    deleteAffectation
} from '../controllers/affect.controller.js';


routeraff.get('/', getAllAffectations);
routeraff.post('/add', addAffectation);
routeraff.put('/maj/:matricule/:numero', updateAffectation);
routeraff.delete('/del/:matricule/:numero', deleteAffectation);



export default routeraff;