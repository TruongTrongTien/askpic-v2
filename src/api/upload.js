import { post } from "../utils/apiHelper";
import { apiUrls } from "../utils/constants";

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("uploaded_file", file);

  // Log the FormData to debug
  for (let [key, value] of formData.entries()) {
    console.log(`FormData key: ${key}, value:`, value);
  }

  try {
    const response = await post(apiUrls.answer, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error.response?.data || error.message);
    throw error;
  }
};


