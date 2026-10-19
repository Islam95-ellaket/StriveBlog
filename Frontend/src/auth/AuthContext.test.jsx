import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext";

function Probe() {
  const { user, initializing, login, logout } = useAuth();
  if (initializing) return <p>caricamento</p>;
  return (
    <div>
      <p>{user ? `ciao ${user.name}` : "ospite"}</p>
      <button onClick={() => login("mario@example.com", "secret123")}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

function mockAuthApi() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      if (url.endsWith("/auth/login")) {
        return new Response(JSON.stringify({ token: "jwt-token" }), { status: 200 });
      }
      if (url.endsWith("/auth/me")) {
        return new Response(
          JSON.stringify({ _id: "1", name: "Mario", email: "mario@example.com" }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify({ message: "not found" }), { status: 404 });
    })
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("senza token mostra lo stato ospite", async () => {
    mockAuthApi();
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    expect(await screen.findByText("ospite")).toBeInTheDocument();
  });

  it("login: salva il token, carica l'utente e logout lo rimuove", async () => {
    mockAuthApi();
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await userEvent.setup().click(screen.getByRole("button", { name: "login" }));

    expect(await screen.findByText("ciao Mario")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBe("jwt-token");

    await userEvent.setup().click(screen.getByRole("button", { name: "logout" }));
    expect(await screen.findByText("ospite")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("con token in localStorage carica la sessione all'avvio", async () => {
    localStorage.setItem("token", "jwt-token");
    mockAuthApi();

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    expect(await screen.findByText("ciao Mario")).toBeInTheDocument();
  });
});
