import express from 'express';
import { createCategory, getCategories, deleteCategory } from '../controllers/categoryController.js';


const categoryRouter = express.Router();

categoryRouter.post('/create', createCategory);
categoryRouter.get('/get', getCategories);
categoryRouter.delete('/delete/:id', deleteCategory);

export default categoryRouter;
