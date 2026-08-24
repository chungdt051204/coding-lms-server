import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
    },
    avatar: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/previews/019/879/186/non_2x/user-icon-on-transparent-background-free-png.png",
    },
    role_id: {
      type: mongoose.Schema.ObjectId,
      ref: "roleEntity",
    },
    login_method: {
      type: String,
      enum: ["email thường", "google"],
      default: "email thường",
    },
    status: {
      type: Boolean,
      default: true,
    },
    level: {
      type: String,
      enum: ["Cử nhân", "Thạc sĩ", "Tiến sĩ"],
    },
    experience: {
      type: Number,
      min: 0,
      max: 20,
    },
    verified_status: {
      type: String,
      enum: ["NOT_VERIFIED", "PENDING", "VERIFIED", "REJECTED"],
    },
    front_id_card: {
      type: String,
    },
    back_id_card: {
      type: String,
    },
    degree_certificate: {
      type: String,
    },
    balance: {
      type: Number,
    },
    access_token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.plugin(paginate);
export default mongoose.model("userEntity", userSchema, "User");
