import express from 'express';
import {createTask, getTasks, updateTask, deleteTask} from '../controllers/taskController.js';

const taskRouter = express.Router();

taskRouter.post('/create', createTask);
taskRouter.get('/get', getTasks);
taskRouter.put('/update/:id', updateTask);
taskRouter.delete('/delete/:id', deleteTask);

export default taskRouter;