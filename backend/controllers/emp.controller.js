import db from '../lib/db.js';

export const getEmployees = (req, res) => {
  db.query('SELECT * FROM employe', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
}


export const getEmployeeById = (req, res) => {
  const { matricule } = req.params;
  db.query('SELECT * FROM employe WHERE matricule = ?', [matricule], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(results[0]);
  });
};


export const createEmployee = (req, res) => {
  const { matricule, nom, affectation ,emploi ,fonction } = req.body;
  db.query('INSERT INTO employe  VALUES (?, ?, ?,?,?)', [matricule, nom, affectation ,emploi ,fonction], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.status(201).json({ id: results.insertId});
  });
}


export const updateEmployee = (req, res) => {
  const { matricule,nom, affectation ,emploi ,fonction } = req.body;
  db.query('UPDATE employe SET nom = ?, affectation = ?, emploi = ?, fonction = ? WHERE matricule = ?', [nom, affectation, emploi, fonction, matricule], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee updated successfully' });
  });
}

export const deleteEmployee = (req, res) => {
  const { matricule } = req.params;
  db.query('DELETE FROM employe WHERE matricule = ?', [matricule], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  });
}