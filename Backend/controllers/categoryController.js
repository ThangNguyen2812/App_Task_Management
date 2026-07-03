import { asyncHandler } from "../middleware/async_handler.js";
import Category from "../models/Categories.js";
import Task from "../models/Tasks.js";

//@desc Get all categories
//@route GET /categories
//@access Private
export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find();
    return res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        data: categories
    });
});

//@desc Create category
//@route POST /categories
//@access Private
export const createCategory = asyncHandler(async (req, res) => {
    const { name, color } = req.body;
    if(!name){
        return res.status(400).json({
            success: false,
            message: "Please add a category name"
        });
    }
    const category = await Category.create({
        user: req.user.id,
        name: name,
        color: color 
    });
    return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category
    });
});


//@desc Delete category
//@route DELETE /categories/:id
//@access Private
export const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if(!category){
        return res.status(404).json({
            success: false,
            message: "Category not found"
        });
    }
    // Nullify category reference in all tasks belonging to this category
    await Task.updateMany({ category: category._id }, { $set: { category: null } });

    await category.deleteOne();
    return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
        data: category
    });
});