import api from "../api/index";

export const deletePost = async (postId: string | number) => {
  return api.delete(`/posts/${postId}`);
};

export const updatePost = async (postId: string | number, data: { text: string }) => {
  return api.patch(`/posts/${postId}`, data);
};

export const reportPost = async (postId: string | number, reason: string) => {
  return api.post(`/reports`, {
    targetType: "post",
    targetId: postId,
    reason,
  });
};

