import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "./Profile";
import { deletePost, getAuthorPosts } from "../../api/client";

const { mockUseAuth } = vi.hoisted(() => ({ mockUseAuth: vi.fn() }));

vi.mock("../../auth/AuthContext", () => ({ useAuth: () => mockUseAuth() }));

vi.mock("../../api/client", () => ({
  getAuthorPosts: vi.fn(),
  uploadAuthorAvatar: vi.fn(),
  deletePost: vi.fn(),
}));

const currentUser = { _id: "u1", name: "Mario", surname: "Rossi", email: "mario@example.com" };

const myPosts = [
  { _id: "p1", title: "Primo articolo", category: "Tech" },
  { _id: "p2", title: "Secondo articolo", category: "Sport" },
];

function renderProfile() {
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );
}

describe("Profile — gestione dei miei articoli", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: currentUser,
      initializing: false,
      refreshUser: vi.fn(),
    });
    getAuthorPosts.mockResolvedValue(myPosts.map((p) => ({ ...p })));
  });

  it("mostra i pulsanti Modifica ed Elimina su ogni articolo", async () => {
    renderProfile();

    expect(await screen.findByText("Primo articolo")).toBeInTheDocument();
    const modifica = screen.getAllByRole("button", { name: "Modifica" });
    const elimina = screen.getAllByRole("button", { name: "Elimina" });
    expect(modifica).toHaveLength(2);
    expect(elimina).toHaveLength(2);
    expect(modifica[0]).toHaveAttribute("href", "/edit/p1");
  });

  it("cancella un articolo solo dopo la conferma e lo rimuove dalla lista", async () => {
    deletePost.mockResolvedValue({ deleted: true });
    renderProfile();

    const eliminaButtons = await screen.findAllByRole("button", { name: "Elimina" });
    fireEvent.click(eliminaButtons[0]);

    expect(deletePost).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Conferma" }));

    await waitFor(() => expect(deletePost).toHaveBeenCalledWith("p1"));
    await waitFor(() =>
      expect(screen.queryByText("Primo articolo")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Secondo articolo")).toBeInTheDocument();
  });

  it("annullando la conferma l'articolo resta nella lista", async () => {
    renderProfile();

    const eliminaButtons = await screen.findAllByRole("button", { name: "Elimina" });
    fireEvent.click(eliminaButtons[0]);
    fireEvent.click(screen.getByRole("button", { name: "Annulla" }));

    expect(deletePost).not.toHaveBeenCalled();
    expect(screen.getByText("Primo articolo")).toBeInTheDocument();
  });

  it("mostra un errore se la cancellazione fallisce", async () => {
    deletePost.mockRejectedValue(new Error("Errore del server"));
    renderProfile();

    const eliminaButtons = await screen.findAllByRole("button", { name: "Elimina" });
    fireEvent.click(eliminaButtons[0]);
    fireEvent.click(screen.getByRole("button", { name: "Conferma" }));

    expect(await screen.findByText(/Errore del server/i)).toBeInTheDocument();
    expect(screen.getByText("Primo articolo")).toBeInTheDocument();
  });
});
