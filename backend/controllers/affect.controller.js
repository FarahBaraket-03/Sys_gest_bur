import db from '../lib/db.js';


export const getAllAffectations = (req, res) => {
  db.query('SELECT * FROM Affectation', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 🔹 Ajouter une nouvelle affectation
export const addAffectation = (req, res) => {
  const { matricule, numero, date_affectation, decision } = req.body;
  const query = 'INSERT INTO Affectation (matricule, numero, date_affectation, decision) VALUES (?, ?, ?, ?)';
  db.query(query, [matricule, numero, date_affectation, decision], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ matricule, numero, date_affectation, decision });
  });
};

// 🔹 Mettre à jour une affectation
export const updateAffectation = (req, res) => {
  const { matricule, numero } = req.params;
  const { date_affectation, decision } = req.body;
  const query = 'UPDATE affectation SET date_affectation = ?, decision = ? WHERE matricule = ? AND numero = ?';
  db.query(query, [date_affectation, decision, matricule, numero], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Affectation non trouvée" });
    res.json({ matricule, numero, date_affectation, decision });
  });
};

// 🔹 Supprimer une affectation
export const deleteAffectation = (req, res) => {
  const { matricule, numero } = req.params;
  const query = 'DELETE FROM Affectation WHERE matricule = ? AND numero = ?';
  db.query(query, [matricule, numero], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Affectation non trouvée" });
    res.json({ message: "Affectation supprimée" });
  });
};