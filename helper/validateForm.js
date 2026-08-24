export const validateForm = {
  validateUserForm: ({ formData }) => {
    const levels = ["Cử nhân", "Thạc sĩ", "Tiến sĩ"];
    const numberRegex = /^[0-9]+$/;
    const alphaRegex =
      /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    let isValid = true;

    //Kiểm tra Họ tên (Nếu có)
    if (formData.fullName !== undefined) {
      if (!formData.fullName.trim()) {
        const error = new Error("Họ tên không được bỏ trống!");
        error.statusCode = 422;
        isValid = false;
        throw error;
      } else if (
        formData.fullName.trim().length < 3 ||
        formData.fullName.trim().length > 50
      ) {
        const error = new Error("Họ tên phải từ 3 đến 50 ký tự!");
        error.statusCode = 422;
        isValid = false;
        throw error;
      } else if (!alphaRegex.test(formData.fullName.trim())) {
        const error = new Error(
          "Họ tên không được chứa số hoặc ký tự đặc biệt!"
        );
        error.statusCode = 422;
        isValid = false;
        throw error;
      }
    }

    //Kiểm tra Email (Nếu có)
    if (formData.email !== undefined) {
      if (!formData.email) {
        const error = new Error("Email không được bỏ trống");
        error.statusCode = 422;
        isValid = false;
        throw error;
      } else if (!emailRegex.test(formData.email)) {
        const error = new Error("Email không đúng định dạng");
        error.statusCode = 422;
        isValid = false;
        throw error;
      }
    }

    // 3. Kiểm tra Password (Nếu có)
    if (formData.password !== undefined) {
      if (!formData.password) {
        const error = new Error("Mật khẩu không được bỏ trống");
        error.statusCode = 422;
        isValid = false;
        throw error;
      } else if (formData.password.length < 6) {
        const error = new Error("Mật khẩu phải có tối thiểu 6 ký tự");
        error.statusCode = 422;
        isValid = false;
        throw error;
      }
    }

    //Kiểm tra số điện thoại (Nếu có)
    if (formData.phone !== undefined) {
      if (!formData.phone) {
        const error = new Error("Số điện thoại không được bỏ trống!");
        error.statusCode = 422;
        isValid = false;
        throw error;
      } else if (!phoneRegex.test(formData.phone)) {
        const error = new Error("Số điện thoại không hợp lệ!");
        error.statusCode = 422;
        isValid = false;
        throw error;
      }
    }

    // Kiểm tra trình độ (Nếu có)
    if (formData.level !== undefined) {
      if (!formData.level) {
        const error = new Error("Vui lòng chọn trình độ!");
        error.statusCode = 422;
        isValid = false;
        throw error;
      } else if (!levels?.includes(formData.level)) {
        const error = new Error("Trình độ không hợp lệ!");
        error.statusCode = 422;
        isValid = false;
        throw error;
      }
    }

    //Kiểm tra kinh nghiệm giảng dạy (Nếu có)
    if (formData.experience !== undefined) {
      if (!formData.experience) {
        const error = new Error("Kinh nghiệm giảng dạy không được để trống!");
        error.statusCode = 422;
        isValid = false;
        throw error;
      } else if (!numberRegex.test(formData.experience)) {
        const error = new Error("Số năm không hợp lệ!");
        error.statusCode = 422;
        isValid = false;
        throw error;
      } else if (formData.experience < 1 || formData.experience > 20) {
        const error = new Error(
          "Chỉ chấp nhận các giảng viên từ 1 đến 20 năm kinh nghiệm!"
        );
        error.statusCode = 422;
        isValid = false;
        throw error;
      }
    }

    return isValid;
  },
  validateFormCourse: ({ courseInfo, categoryIds }) => {
    const courseNameRegex = /^[\p{L}\p{N}\s&.+\-_()#/,"';:!?%*]+$/u;
    const onlyNumberRegex = /^[0-9]+$/;
    const levels = ["Cơ bản", "Trung bình", "Nâng cao"];
    let isValid = true;
    //Kiểm tra tên khóa học
    if (!courseInfo.courseName.trim()) {
      const error = new Error("Tên khóa học không được bỏ trống!");
      error.statusCode = 422;
      isValid = false;
      throw error;
    } else if (
      courseInfo.courseName.trim().length < 3 ||
      courseInfo.courseName.trim().length > 50
    ) {
      const error = new Error("Tên khóa học phải từ 3 đến 50 ký tự!");
      error.statusCode = 422;
      isValid = false;
      throw error;
    } else if (!courseNameRegex.test(courseInfo.courseName)) {
      const error = new Error(
        "Tên khóa học không được chứa ký tự không hợp lệ!"
      );
      error.statusCode = 422;
      isValid = false;
      throw error;
    }
    //Kiểm tra mô tả
    if (!courseInfo.description) {
      const error = new Error("Mô tả không được bỏ trống!");
      error.statusCode = 422;
      isValid = false;
      throw error;
    }
    //Kiểm tra danh mục
    if (!courseInfo.category_id) {
      const error = new Error("Vui lòng chọn danh mục!");
      error.statusCode = 422;
      isValid = false;
      throw error;
    } else if (
      !categoryIds.some((value) => value._id == courseInfo.category_id)
    ) {
      const error = new Error("Danh mục không hợp lệ!");
      error.statusCode = 422;
      isValid = false;
      throw error;
    }
    //Kiểm tra cấp độ
    if (!courseInfo.level) {
      const error = new Error("Vui lòng chọn cấp độ!");
      error.statusCode = 422;
      isValid = false;
      throw error;
    } else if (!levels.includes(courseInfo.level)) {
      const error = new Error("Không có cấp độ này!");
      error.statusCode = 422;
      isValid = false;
      throw error;
    }
    //Kiểm tra giá
    if (!onlyNumberRegex.test(courseInfo.price)) {
      const error = new Error("Vui lòng nhập đúng định dạng giá!");
      error.statusCode = 422;
      isValid = false;
      throw error;
    }
    return isValid;
  },
};
