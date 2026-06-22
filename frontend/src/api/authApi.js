// src/api/authApi.js

import api from "./axiosInstance";

// ─── AUTH ───────────────────────────────────────
export const authApi = {
  login:          (data) => api.post("/auth/login/", data),
  register:       (data) => api.post("/auth/register/", data),
  logout:         (data) => api.post("/auth/logout/", data),
  me:             ()     => api.get("/auth/me/"),
  changePassword: (data) => api.put("/auth/change-password/", data),
  refresh:        (data) => api.post("/auth/refresh/", data),
};

// ─── SCHOOLS ────────────────────────────────────
export const schoolApi = {
  list:    ()         => api.get("/schools/"),
  get:     (id)       => api.get(`/schools/${id}/`),
  create:  (data)     => api.post("/schools/", data),
  update:  (id, data) => api.put(`/schools/${id}/`, data),
  delete:  (id)       => api.delete(`/schools/${id}/`),
  approve: (id)       => api.post(`/schools/${id}/approve/`),
  reject:  (id)       => api.post(`/schools/${id}/reject/`),
};

// ─── CLASSES ────────────────────────────────────
export const classApi = {
  list:   (params)    => api.get("/classes/", { params }),
  get:    (id)        => api.get(`/classes/${id}/`),
  create: (data)      => api.post("/classes/", data),
  update: (id, data)  => api.put(`/classes/${id}/`, data),
  delete: (id)        => api.delete(`/classes/${id}/`),
};

// ─── STUDENTS ───────────────────────────────────
export const studentApi = {
  list:   (params)    => api.get("/students/", { params }),
  get:    (id)        => api.get(`/students/${id}/`),
  create: (data)      => api.post("/students/", data),
  update: (id, data)  => api.put(`/students/${id}/`, data),
  delete: (id)        => api.delete(`/students/${id}/`),
};

// ─── TEACHERS ───────────────────────────────────
export const teacherApi = {
  list:   (params)    => api.get("/teachers/", { params }),
  get:    (id)        => api.get(`/teachers/${id}/`),
  create: (data)      => api.post("/teachers/", data),
  update: (id, data)  => api.put(`/teachers/${id}/`, data),
  delete: (id)        => api.delete(`/teachers/${id}/`),
};

// ─── ATTENDANCE ─────────────────────────────────
export const attendanceApi = {
  list:     (params) => api.get("/attendance/", { params }),
  markBulk: (data)   => api.post("/attendance/mark-bulk/", data),
  summary:  (params) => api.get("/attendance/summary/", { params }),
};

// ─── HOMEWORK ───────────────────────────────────
export const homeworkApi = {
  list:   (params)    => api.get("/homework/", { params }),
  get:    (id)        => api.get(`/homework/${id}/`),
  create: (data)      => api.post("/homework/", data),
  update: (id, data)  => api.put(`/homework/${id}/`, data),
  delete: (id)        => api.delete(`/homework/${id}/`),
  upload: (id, form)  => api.post(`/homework/${id}/upload-attachment/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
};

// ─── EXAMS ──────────────────────────────────────
export const examApi = {
  list:          (params) => api.get("/exams/", { params }),
  get:           (id)     => api.get(`/exams/${id}/`),
  create:        (data)   => api.post("/exams/", data),
  bulkUpload:    (data)   => api.post("/exam-results/bulk-upload/", data),
  studentReport: (params) => api.get("/exam-results/student-report/", { params }),
};

// ─── FEES ───────────────────────────────────────
export const feeApi = {
  categories:    (params) => api.get("/fee-categories/", { params }),
  createCategory: (data)   => api.post("/fee-categories/", data), 
  structures:    (params) => api.get("/fee-structures/",  { params }),
  createStructure:(data)   => api.post("/fee-structures/", data),
  payments:      (params) => api.get("/fee-payments/",    { params }),
  createPayment: (data)   => api.post("/fee-payments/", data),
  summary:       (params) => api.get("/fee-payments/student-summary/", { params }),
};

// ─── NOTIFICATIONS ──────────────────────────────
export const notificationApi = {
  list:        ()   => api.get("/notifications/"),
  unreadCount: ()   => api.get("/notifications/unread-count/"),
  markRead:    (id) => api.post(`/notifications/${id}/mark-read/`),
  markAllRead: ()   => api.post("/notifications/mark-all-read/"),
};