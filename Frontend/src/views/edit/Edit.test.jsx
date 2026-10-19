import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EditPost from "./Edit";
import { getPost, updatePost, uploadPostCover } from "../../api/client";

const { mockUseAuth } = vi.hoisted(() => ({ mockUseAuth: vi.fn() }));

vi.mock("../../auth/AuthContext", () => ({ useAuth: () => mockUseAuth() }));

vi.mock("../../api/client", () => ({
  ApiError: class ApiError extends Error {
    constructor(status, message, errors = []) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.errors = errors;
    }
  },
  getPost: vi.fn(),
  updatePost: vi.fn(),
  uploadPostCover: vi.fn(),
}));

const currentUser = { _id: "u1", name: "Mario", surname: "Rossi" };

const ownPost = {
  _id: "p1",
  title: "Titolo iniziale",
  category: "Tech",
  content: "<p>Contenuto iniziale dell'articolo.</p>",
  cover: "https://res.cloudinary.com/x/striveBlog/cover.jpg",
  readTime: { value: 2, unit: "minutes" },
  author: { _id: "u1", name: "Mario", surname: "Rossi" },
};

function renderEdit(id = "p1") {
  return render(
    <MemoryRouter initialEntries={[`/edit/${id}`]}>
      <Routes>
        <Route path="/edit/:id" element={<EditPost />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("EditPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: currentUser, initializing: false });
  });

  it("precarica titolo, categoria, contenuto e cover attuale", async () => {
    getPost.mockResolvedValue(ownPost);
    renderEdit();

    expect(await screen.findByDisplayValue("Titolo iniziale")).toBeInTheDocument();
    expect(screen.getByLabelText("Categoria")).toHaveValue("Tech");
    expect(screen.getByText(/Contenuto iniziale/)).toBeInTheDocument();
    expect(screen.getByAltText("Cover attuale")).toBeInTheDocument();
  });

  it("blocca la modifica di articoli di altri autori", async () => {
    getPost.mockResolvedValue({ ...ownPost, author: { _id: "altro", name: "Luca" } });
    renderEdit();

    expect(
      await screen.findByText(/Puoi modificare solo i tuoi articoli/i)
    ).toBeInTheDocument();
    expect(updatePost).not.toHaveBeenCalled();
  });

  it("salva con PUT preservando cover e tempo di lettura attuali", async () => {
    getPost.mockResolvedValue(ownPost);
    updatePost.mockResolvedValue({ ...ownPost, title: "Nuovo titolo" });
    renderEdit();

    const titleInput = await screen.findByDisplayValue("Titolo iniziale");
    fireEvent.change(titleInput, { target: { value: "Nuovo titolo" } });
    fireEvent.click(screen.getByRole("button", { name: "Salva modifiche" }));

    await waitFor(() => expect(updatePost).toHaveBeenCalledTimes(1));
    const [postId, payload] = updatePost.mock.calls[0];
    expect(postId).toBe("p1");
    expect(payload.title).toBe("Nuovo titolo");
    expect(payload.category).toBe("Tech");
    expect(payload.cover).toBe(ownPost.cover);
    expect(payload.readTime).toEqual(ownPost.readTime);
    expect(payload.content).toContain("Contenuto iniziale");
  });

  it("carica la nuova cover dopo il salvataggio quando ne viene selezionata una", async () => {
    getPost.mockResolvedValue(ownPost);
    updatePost.mockResolvedValue(ownPost);
    uploadPostCover.mockResolvedValue({ status: "success" });
    renderEdit();
    await screen.findByDisplayValue("Titolo iniziale");

    const file = new File(["img"], "nuova.png", { type: "image/png" });
    const fileInput = document.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByRole("button", { name: "Salva modifiche" }));

    await waitFor(() => expect(uploadPostCover).toHaveBeenCalledWith("p1", file));
    expect(updatePost).toHaveBeenCalledTimes(1);
  });
});
