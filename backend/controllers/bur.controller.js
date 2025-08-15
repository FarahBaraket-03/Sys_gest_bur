import db from '../lib/db.js';

export const getbureau = (req, res) => {
  db.query('SELECT * FROM bureau', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
}


export const getBureauById = (req, res) => {
  const { numero } = req.params;
  db.query('SELECT * FROM bureau WHERE numero = ?', [numero], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Bureau not found' });
    }
    res.json(results[0]);
  });
}


export const createBureau = (req, res) => {
  const { numero, niveau, superficie } = req.body;
  db.query('INSERT INTO bureau  VALUES (?, ?, ?)', [numero, niveau , superficie], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.status(201).json({ id: results.insertId });
  });
}



export const updateBureau = (req, res) => {

  const { numero,niveau, superficie } = req.body;
  db.query('UPDATE bureau SET niveau = ?, superficie = ? WHERE numero = ?', [niveau, superficie, numero], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Bureau not found' });
    }
    res.json({ message: 'Bureau updated successfully' });
  });
}



export const deleteBureau = (req, res) => {
  const { numero } = req.params;
  db.query('DELETE FROM bureau WHERE numero = ?', [numero], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Bureau not found' });
    }
    res.json({ message: 'Bureau deleted successfully' });
  });
}


export const getBureauxGrouped =  (req, res) => {
  
  db.query("SELECT * FROM bureau ORDER BY niveau, numero",(err,results)=>{
    if (!results || results.length === 0) {
    return res.status(404).json({ error: 'No bureaux found' });}

    const grouped = {};
    results.forEach((b) => {
    const key = `niv ${b.niveau}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      name: `B${b.numero}`,
      size: Number(b.superficie),
    });
  });
  

  const response = Object.entries(grouped).map(([name, children]) => ({ name, children }));
  res.json(response);

  });
  
  
};
