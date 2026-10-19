import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BlogItem from "./BlogItem";

function renderItem(props) {
  return render(
    <MemoryRouter>
      <BlogItem {...props} />
    </MemoryRouter>
  );
}

describe("BlogItem", () => {
  it("mostra il titolo e il placeholder quando manca la cover", () => {
    renderItem({ _id: "1", title: "Il mio articolo", category: "Tech" });

    expect(screen.getByText("Il mio articolo")).toBeInTheDocument();
    expect(screen.getByText("Tech")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("mostra la cover quando presente", () => {
    renderItem({ _id: "1", title: "Articolo", cover: "https://example.com/cover.jpg" });

    const img = screen.getByRole("img", { name: "Articolo" });
    expect(img).toHaveAttribute("src", "https://example.com/cover.jpg");
  });

  it("mostra le azioni extra quando fornite (modifica/elimina)", () => {
    renderItem({
      _id: "1",
      title: "Articolo",
      actions: <button type="button">Elimina</button>,
    });

    expect(screen.getByRole("button", { name: "Elimina" })).toBeInTheDocument();
  });
});
