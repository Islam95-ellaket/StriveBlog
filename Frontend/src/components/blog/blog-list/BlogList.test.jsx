import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BlogList from "./BlogList";
import { getPosts } from "../../../api/client";

const { mockUseAuth } = vi.hoisted(() => ({ mockUseAuth: vi.fn() }));
vi.mock("../../../auth/AuthContext", () => ({ useAuth: () => mockUseAuth() }));
vi.mock("../../../api/client", () => ({ getPosts: vi.fn() }));

const loggedUser = { _id: "u1", name: "Mario" };

function renderList() {
  return render(
    <MemoryRouter>
      <BlogList />
    </MemoryRouter>
  );
}

describe("BlogList e stato di autenticazione", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("a utente non autenticato chiede il login senza chiamare il backend", async () => {
    mockUseAuth.mockReturnValue({ user: null, initializing: false });
    getPosts.mockResolvedValue([{ _id: "p1", title: "Segreto", category: "Tech" }]);

    renderList();

    expect(
      await screen.findByText(/Accedi per vedere gli articoli/i)
    ).toBeInTheDocument();
    expect(screen.queryByText("Segreto")).not.toBeInTheDocument();
    expect(getPosts).not.toHaveBeenCalled();
  });

  it("a utente autenticato mostra gli articoli caricati", async () => {
    mockUseAuth.mockReturnValue({ user: loggedUser, initializing: false });
    getPosts.mockResolvedValue([{ _id: "p1", title: "Articolo visibile", category: "Tech" }]);

    renderList();

    expect(await screen.findByText("Articolo visibile")).toBeInTheDocument();
    expect(getPosts).toHaveBeenCalledTimes(1);
  });

  it("al logout gli articoli scompaiono e riappare la richiesta di login", async () => {
    mockUseAuth.mockReturnValue({ user: loggedUser, initializing: false });
    getPosts.mockResolvedValue([{ _id: "p1", title: "Articolo privato", category: "Tech" }]);

    const { rerender } = renderList();
    expect(await screen.findByText("Articolo privato")).toBeInTheDocument();

    mockUseAuth.mockReturnValue({ user: null, initializing: false });
    rerender(
      <MemoryRouter>
        <BlogList />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Accedi per vedere gli articoli/i)
    ).toBeInTheDocument();
    expect(screen.queryByText("Articolo privato")).not.toBeInTheDocument();
    expect(getPosts).toHaveBeenCalledTimes(1);
  });
});
