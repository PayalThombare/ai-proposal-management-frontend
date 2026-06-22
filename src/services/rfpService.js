import api from "../utils/api";

export const uploadRFP = async (formData) => {
  const response = await api.post(
    "/rfp/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getAllRFPs = async () => {
  const response = await api.get("/rfp");

  return response.data;
};

export const getRFPById = async (id) => {
  const response = await api.get(`/rfp/${id}`);

  return response.data;
};