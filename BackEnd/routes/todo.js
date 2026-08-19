import { Router } from "express";
import pool from "../db.js";

const router = Router();

// post new TO-DO task
router.post("/", async (req, res) => {
  try {
    const { description, completed } = req.body;
    const newToDo = await pool.query(
      "INSERT INTO todo (description, completed) VALUES ($1, $2) RETURNING *",
      [description, completed || false],
    );
    res.json(newToDo.rows[0]);
  } catch (err) {
    res.status(500).send("server error");
  }
});

// get all todo tasks
router.get("/", async (req, res) => {
  try {
    const allToDo = await pool.query("SELECT * FROM todo");
    res.json(allToDo.rows);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// get one todo by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await pool.query("SELECT * FROM todo WHERE task_dd = $1", [
      id,
    ]);

    if (todo.rows.length === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(todo.rows[0]);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// update todo
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description, completed } = req.body;

    const updatedTodo = await pool.query(
      `UPDATE todo
       SET description = $1,
           completed = $2
       WHERE task_dd = $3
       RETURNING *`,
      [description, completed, id],
    );

    if (updatedTodo.rows.length === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(updatedTodo.rows[0]);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// delete todo
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTodo = await pool.query(
      "DELETE FROM todo WHERE task_dd = $1 RETURNING *",
      [id],
    );

    if (deletedTodo.rows.length === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(deletedTodo.rows[0]);
  } catch (error) {
    res.status(500).send("Server error");
  }
});
export default router;
