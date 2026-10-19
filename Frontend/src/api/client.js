export const API_URL = import.meta.env.VITE_API_URL;

const TOKEN_KEY = "token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export async function apiFetch(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let result;
  try {
    result = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError(0, "Errore di rete: il server non risponde.");
  }

  let data = null;
  const text = await result.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!result.ok) {
    const message = data?.message || `Errore inatteso (HTTP ${result.status})`;
    throw new ApiError(result.status, message, data?.errors || []);
  }

  return data;
}

export const getPosts = () => apiFetch("/blogPosts");

export const getPost = (id) => apiFetch(`/blogPosts/${id}`);

export const createPost = (payload) =>
  apiFetch("/blogPosts", { method: "POST", body: payload });

export const updatePost = (id, payload) =>
  apiFetch(`/blogPosts/${id}`, { method: "PUT", body: payload });

export const deletePost = (id) =>
  apiFetch(`/blogPosts/${id}`, { method: "DELETE" });

export const loginRequest = (email, password) =>
  apiFetch("/auth/login", { method: "POST", body: { email, password }, auth: false });

export const registerRequest = (payload) =>
  apiFetch("/auth/register", { method: "POST", body: payload, auth: false });

export const getMe = () => apiFetch("/auth/me");

export const addComment = (postId, content) =>
  apiFetch(`/blogPosts/${postId}/comments`, { method: "POST", body: { content } });

export const updateComment = (postId, commentId, content) =>
  apiFetch(`/blogPosts/${postId}/comments/${commentId}`, {
    method: "PUT",
    body: { content },
  });

export const deleteComment = (postId, commentId) =>
  apiFetch(`/blogPosts/${postId}/comments/${commentId}`, { method: "DELETE" });

export const getAuthorPosts = (authorId) => apiFetch(`/authors/${authorId}/blogPosts`);

export const uploadPostCover = (postId, file) => {
  const formData = new FormData();
  formData.append("cover", file);
  return apiFetch(`/blogPosts/${postId}/cover`, { method: "PATCH", body: formData });
};

export const uploadAuthorAvatar = (authorId, file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return apiFetch(`/authors/${authorId}/avatar`, { method: "PATCH", body: formData });
};
