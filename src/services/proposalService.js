import api from "../utils/api";

export const createProposal = async (data) => {
  const response = await api.post(
    "/proposals",
    data
  );

  return response.data;
};

export const getAllProposals = async () => {
  const response = await api.get("/proposals");
  return response.data;
};

export const getProposalById = async (id) => {
  const response = await api.get(`/proposals/${id}`);
  return response.data;
};

export const approveProposal = async (id) => {
  const response = await api.patch(
    `/proposals/${id}/approve`
  );

  return response.data;
};

export const getProposalByRfpId = async (
  rfpId
) => {
  const response = await api.get(
    `/proposals/rfp/${rfpId}`
  );

  return response.data;
};

export const downloadProposalPdf = async (
  proposalId
) => {
  const response = await api.get(
    `/proposals/${proposalId}/download`
  );

  return response.data;
};

export const rejectProposal = async (id, rejectionReason) => {
  const response = await api.patch(
    `/proposals/${id}/reject`,
    { rejectionReason }
  );

  return response.data;
};
