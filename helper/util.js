export const util = {
  shuffleArray: ({ array }) => {
    const newArray = [...array];
    for (let i = newArray?.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },
  //Hàm bỏ dấu tiếng Việt
  removeVietnameseTones: (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  },
};
