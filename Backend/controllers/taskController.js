import { asyncHandler } from "../middleware/async_handler.js";
import Task from "../models/Tasks.js";
import Category from "../models/Categories.js";


//@desc Create task
//@route POST /tasks
//@access Private
export const createTask = asyncHandler(async (req, res) => {
    const { title, description, categoryId, category, isCompleted } = req.body;

    if(!title){
        return res.status(400).json({
            success: false,
            message: "Please add a task title"
        });
    }
    const task = await Task.create({
        user: req.user.id,
        title: title,
        description: description,
        category: categoryId || category, // Support both categoryId and category in body
        isCompleted: isCompleted,
    });
    return res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task
    });
});


//@desc Get all task
//@route GET /tasks
//@access Private
export const getTasks = asyncHandler(async (req, res) => {
    const query = { user: req.user.id };

    //Filter by status
    if(req.query.isCompleted){
        query.isCompleted = req.query.isCompleted;
    }

    //Filter by category
    if(req.query.categoryId){
        query.category = req.query.categoryId; // Fixed to match Tasks schema
    }

    //Search for title
    if(req.query.search){
        query.title ={
            $regex: req.query.search,
            $options: 'i'
        };
    }

    //Sort tasks
    let sortCriteria = {};
    if (req.query.sortBy) {
        const [key, order] = req.query.sortBy.split(':'); // createdAt:asc
        sortCriteria[key] = order === 'desc' ? -1 : 1;
    } else {
        sortCriteria = { createdAt: -1 }; // Default: Newest first
    }

    //Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const totalTasks = await Task.countDocuments(query);

    //Get tasks and populate category details
    const tasks = await Task.find(query)
    .populate('category')
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit);

    return res.status(200).json({
        success: true,
        message: "Tasks fetched successfully",
        data: tasks,
        totalTasks,
        page,
        limit
    });
});


//@desc Update task
//@route PUT /tasks/:id
//@access Private
export const updateTask = asyncHandler(async (req, res) => {
    const { title, description, categoryId, category, isCompleted } = req.body;
    const task = await Task.findById(req.params.id);
    if(!task){
        return res.status(404).json({
            success: false,
            message: "Task not found"
        });
    }
    task.title = title || task.title;
    task.description = description || task.description;
    task.category = categoryId || category || task.category; // Support both in update
    task.isCompleted = isCompleted !== undefined ? isCompleted : task.isCompleted;
    await task.save();
    return res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: task
    });
});


//@desc Delete task
//@route DELETE /tasks/:id
//@access Private
export const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if(!task){
        return res.status(404).json({
            success: false,
            message: "Task not found"
        });
    }
    await task.deleteOne();
    return res.status(200).json({
        success: true,
        message: "Task deleted successfully",
        data: task
    });
});
