import categoryEntity from "../models/categoryModel.js";
import courseEntity from "../models/courseModel.js";
export class CategoryService {
  getAllCategories = async () => {
    const categories = await categoryEntity.find();
    const arrayCategories = await Promise.all(
      categories?.map(async (value) => {
        const numberCourse = await courseEntity.countDocuments({
          category_id: value._id,
          status: "approved",
        });
        return { item: value, numberCourse };
      })
    );
    return arrayCategories || [];
  };
}
