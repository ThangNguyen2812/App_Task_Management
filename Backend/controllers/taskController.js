import { asyncHandler } from "../middleware/async_handler.js";
import Task from "../models/Tasks.js";
import Category from "../models/Categories.js";


//@desc Create task
//@route POST /tasks
//@access Private
export const createTask = asyncHandler(async (req, res) => {
    const { title, description, categoryId, isCompleted } = req.body;

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
        categoryId: categoryId,
        isCompleted: isCompleted,
    });
    return res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task
    });
});