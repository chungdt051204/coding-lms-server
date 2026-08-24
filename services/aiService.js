import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});
import categoryEntity from "../models/categoryModel.js";
import courseEntity from "../models/courseModel.js";
import userEntity from "../models/userModel.js";
import enrollmentEntity from "../models/enrollmentModel.js";
export class AiService {
  sendMessage = async ({ input, userId }) => {
    const intents = {
      GREETING: {
        description: "Chào hỏi, giao tiếp xã giao",
        entities: [],
      },
      SEARCH_COURSE: {
        description: "Tìm kiếm khóa học theo điều kiện",
        entities: [
          "courseName",
          { categoryName: ["web", "mobile", "window"] },
          "instructorName",
          { level: ["Cơ bản", "Trung bình", "Nâng cao"] },
          { price: ["cheap", "expensive"] },
          { rating: ["high", "low", "nổi bật", "đánh giá kém"] },
        ],
      },
      LEARNING_PROGRESS: {
        description: "Xem tiến độ học tập",
        entities: [],
      },
      PROGRAMMING_QUESTION: {
        description: "Giải thích kiến thức lập trình",
        entities: ["technology"],
      },

      OUT_OF_SCOPE: {
        description: "Ngoài phạm vi hỗ trợ",
        entities: [],
      },
    };
    const message = `Đây là input của người dùng: ${input}. Hãy phân tích thật kỹ input và trả về cho tôi từ khóa nằm trong các intent sau: ${JSON.stringify(
      intents
    )}. Chỉ trả về dữ liệu kiểu object thuần, không bọc json, phải luôn có key intent và entities`;
    let interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-lite",
      input: message,
    });
    console.log(interaction.output_text);
    interaction = JSON.parse(interaction.output_text);
    console.log(interaction);
    const intent = interaction?.intent;
    let result = "";
    let prompt = "";
    switch (intent) {
      case "GREETING":
        result = "Xin chào, tôi là trợ lý AI, tôi có thể giúp được gì cho bạn";
        break;
      case "SEARCH_COURSE":
        const courseName = interaction?.entities?.courseName;
        const categoryName = interaction?.entities?.categoryName;
        const instructorName = interaction?.entities?.instructorName;
        const level = interaction?.entities?.level;
        const price = interaction?.entities?.price;
        const rating = interaction?.entities?.rating;
        let query = {};
        if (courseName)
          query.course_name = { $regex: courseName, $options: "i" };
        if (categoryName) {
          const categories = await categoryEntity.find({
            category_name: {
              $regex: categoryName,
              $options: "i",
            },
          });
          const categoryIds = categories?.map((value) => {
            return value?._id;
          });
          query.category_id = {
            $in: categoryIds,
          };
        }
        if (instructorName) {
          const instructor = await userEntity.findOne({
            full_name: { $regex: instructorName, $options: "i" },
          });
          query.user_id = instructor?._id;
        }
        if (level) {
          query.level = level;
        }
        if (price) {
          if (price == "cheap") query.price = { $lte: 300000 };
          else query.price = { $gte: 300000 };
        }
        if (rating) {
          if (rating == "high" || rating == "nổi bật")
            query.rating_star = { $gte: 4.5 };
          else if (rating == "low" || rating == "đánh giá kém")
            query.rating_star = { $lte: 2 };
        }
        const courses = await courseEntity
          .find({
            ...query,
            status: "approved",
            is_visible: true,
          })
          .select(
            "course_name description level price image_url rating_star user_id category_id"
          )
          .populate("user_id", "full_name")
          .populate("category_id", "category_name");
        result = courses;
        // prompt = `Đây là kết quả tìm kiếm khóa học ${courses}. Hãy chọn lọc thông tin và liệt kê theo từng gạch đầu dòng, mỗi gạch đầu dòng đều phải xuống dòng, không sử dụng ký tự sao`;
        break;
      case "LEARNING_PROGRESS":
        const enrollments = await enrollmentEntity
          .find({
            user_id: userId,
          })
          .select(
            "course_id access_level total_lessons completed_lessons progress_percent"
          )
          .populate("course_id", "course_name image_url");
        result = enrollments;
        // prompt = `Đây là danh sách khóa học đã đăng ký và tiến độ học tập của người dùng ${enrollments}. Hãy chọn lọc thông tin và liệt kê theo từng gạch đầu dòng, mỗi gạch đầu dòng đều phải xuống dòng, không sử dụng ký tự sao. Mỗi item cách 1 dòng`;
        break;
      case "PROGRAMMING_QUESTION":
        prompt = `Đây là input của người dùng: ${input}. Hãy trình bày ngắn gọn, không sử dụng ký tự *`;
        break;
      case "OUT_OF_SCOPE":
        result = "Ngoài phạm vi hỗ trợ, tôi không thể trả lời câu hỏi này";
        break;
      default:
        break;
    }
    console.log(prompt);
    if (prompt) {
      result = await ai.interactions.create({
        model: "gemini-3.1-flash-lite",
        input: prompt,
      });
    }
    return { data: prompt ? result?.output_text : result, intent, interaction };
  };
}
