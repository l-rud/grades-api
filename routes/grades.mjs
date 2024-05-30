import express from 'express';
import db from '../db/conn.mjs';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Create a single grade entry
router.post('/', async (req, res) => {
  try {
    const grades = await db.collection('grades');
    const newDocument = req.body;

    // rename fields for backwards compatibility
    // We check if there is a student_id field in the newDocument
    if (newDocument.student_id) {
      //If there is a student_id field, we create a learner_id field and give it the same value of the student_id field
      newDocument.learner_id = newDocument.student_id;
      // We delete the student_id field from the object where we only have the learner_id field
      delete newDocument.student_id;
    }

    const result = await grades.insertOne(newDocument);
    res.json(result).status(204);
  } catch (err) {
    res.send(err.message).status(err.status ? err.status : 400);
  }
});

// Get a single grade by id
router.get('/:id', async (req, res) => {
  let id;
  try {
    id = new ObjectId(req.params.id);
  } catch (e) {
    res.status(400).send({
      error: 'Please send a valid ObjectId',
    });
    return;
  }

  let collection = await db.collection('grades');
  let query = { _id: id };
  let result = await collection.findOne(query);

  if (!result) {
    res.send('Not Found').status(400);
  } else {
    res.json(result).status(200);
  }
});

//Add a score to a grade entry
router.patch('/:id/add', async (req, res) => {
  try {
    const grades = await db.collection('grades');
    const query = { _id: new ObjectId(req.params.id) };

    const result = await grades.updateOne(query, {
      $push: { scores: req.body },
    });

    if (!result) {
      const err = new Error('Not Found');
      err.status = 404;
      throw err;
    } else {
      res.json(result).status(200);
    }
  } catch (err) {
    res.send(err.message).status(err.status ? err.status : 400);
  }
});

// Remove a score from a grade entry
router.patch('/:id/remove', async (req, res) => {
  try {
    const grades = await db.collection('grades');
    const query = { _id: new ObjectId(req.params.id) };

    const result = await grades.updateOne(query, {
      $pull: { scores: req.body },
    });

    if (!result) {
      const err = new Error('Not Found');
      err.status = 404;
      throw err;
    } else {
      res.json(result).status(200);
    }
  } catch (err) {
    res.send(err.message).status(err.status ? err.status : 400);
  }
});

// Delete a single grade entry
router.delete('/:id', async (req, res) => {
  let collection = await db.collection('grades');
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.deleteOne(query);

  if (!result) res.send('Not found').status(404);
  else res.send(result).status(200);
});

// Get a student's grade data
router.get('/learner/:id', async (req, res) => {
  try {
    const grades = await db.collection('grades');
    const query = { learner_id: Number(req.params.id) };

    //Check for class_id query parameter
    if (req.query.class) {
      query.class_id = Number(req.query.class);
    }

    const result = await grades.find(query).toArray();

    if (!result.length) {
      const err = new Error('Not Found');
      err.status = 404;
      throw err;
    } else {
      res.json(result).status(200);
    }
  } catch (err) {
    res.send(err.message).status(err.status ? err.status : 400);
  }
});

// Student route backwards compatibility
router.get('/student/:id', (req, res) => {
  res.redirect(`../learner/${req.params.id}`);
});

// Delete a learner's grade data
router.delete('/learner/:id', async (req, res) => {
  let collection = await db.collection('grades');
  let query = { learner_id: Number(req.params.id) };

  let result = await collection.deleteMany(query);

  if (!result) res.send('Not found').status(404);
  else res.send(result).status(200);
});

// Get a class's grade data
router.get('/class/:id', async (req, res) => {
  try {
    const grades = await db.collection('grades');
    const query = { class_id: Number(req.params.id) };

    //Check for learner query parameter
    if (req.query.learner) {
      query.learner_id = Number(req.query.learner);
    }

    const result = await grades.find(query).toArray();

    if (!result.length) {
      const err = new Error('Not Found');
      err.status = 404;
      throw err;
    } else {
      res.json(result).status(200);
    }
  } catch (err) {
    res.send(err.message).status(err.status ? err.status : 400);
  }
});

//Update a class id
router.patch('/class/:id', async (req, res) => {
  try {
    const grades = await db.collection('grades');
    const query = { class_id: Number(req.params.id) };

    const result = await grades.updateMany(query, {
      $set: { class_id: req.body.class_id },
    });

    if (!result) {
      const err = new Error('Not Found');
      err.status = 404;
      throw err;
    } else {
      res.json(result).status(200);
    }
  } catch (err) {
    res.send(err.message).status(err.status ? err.status : 400);
  }
});

// Delete a class
router.delete('/class/:id', async (req, res) => {
  let collection = await db.collection('grades');
  let query = { class_id: Number(req.params.id) };

  let result = await collection.deleteMany(query);

  if (!result) res.send('Not found').status(404);
  else res.send(result).status(200);
});

export default router;