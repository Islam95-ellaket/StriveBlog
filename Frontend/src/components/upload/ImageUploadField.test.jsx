import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import ImageUploadField, { IMAGE_MAX_BYTES, validateImageFile } from "./ImageUploadField";

describe("validateImageFile", () => {
  it("accetta PNG e JPG entro il limite di dimensione", () => {
    const png = new File(["x"], "a.png", { type: "image/png" });
    const jpg = new File(["x"], "a.jpg", { type: "image/jpeg" });
    expect(validateImageFile(png)).toBeNull();
    expect(validateImageFile(jpg)).toBeNull();
  });

  it("rifiuta formati non supportati", () => {
    const gif = new File(["x"], "a.gif", { type: "image/gif" });
    expect(validateImageFile(gif)).toMatch(/Formato non supportato/);
  });

  it("rifiuta file oltre la dimensione massima", () => {
    const big = new File([new Uint8Array(IMAGE_MAX_BYTES + 1)], "big.png", {
      type: "image/png",
    });
    expect(validateImageFile(big)).toMatch(/troppo grande/);
  });
});

describe("ImageUploadField", () => {
  function Harness() {
    const [file, setFile] = useState(null);
    return (
      <ImageUploadField id="t" label="Cover" file={file} onChange={setFile} />
    );
  }

  it("seleziona un file valido e mostra l'anteprima con le azioni", async () => {
    const { container } = render(<Harness />);
    const input = container.querySelector('input[type="file"]');
    const png = new File(["img"], "cover.png", { type: "image/png" });

    await userEvent.setup().upload(input, png);

    expect(await screen.findByAltText(/Anteprima della cover/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sostituisci" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rimuovi" })).toBeInTheDocument();
  });

  it("rifiuta un formato non valido e mostra l'errore", async () => {
    const { container } = render(<Harness />);
    const input = container.querySelector('input[type="file"]');
    const gif = new File(["img"], "anim.gif", { type: "image/gif" });

    await userEvent.setup({ applyAccept: false }).upload(input, gif);

    expect(await screen.findByRole("alert")).toHaveTextContent(/Formato non supportato/);
    expect(screen.queryByAltText(/Anteprima della cover/)).not.toBeInTheDocument();
  });

  it("rimuove il file selezionato", async () => {
    const { container } = render(<Harness />);
    const input = container.querySelector('input[type="file"]');
    const png = new File(["img"], "cover.png", { type: "image/png" });

    await userEvent.setup().upload(input, png);
    await userEvent.setup().click(
      await screen.findByRole("button", { name: "Rimuovi" })
    );

    expect(screen.queryByAltText(/Anteprima della cover/)).not.toBeInTheDocument();
    expect(screen.getByText(/Seleziona un'immagine dal computer/)).toBeInTheDocument();
  });
});
