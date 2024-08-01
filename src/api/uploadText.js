import { post } from "../utils/apiHelper";
import { apiUrls } from "../utils/constants";

export const uploadText = async (text) => {
  try {
    // Mã hóa dữ liệu thành định dạng application/x-www-form-urlencoded
    const encodedData = new URLSearchParams();
    encodedData.append('text', text);

    const response = await post(apiUrls.text, encodedData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error generating answer:", error);
    throw error;
  }
};
