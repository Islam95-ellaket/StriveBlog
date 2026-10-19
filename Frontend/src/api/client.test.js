import { ApiError, apiFetch, deletePost, setToken, updatePost } from "./client";

describe("apiFetch", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("allega il token Bearer e restituisce il JSON parsato", async () => {
    setToken("abc123");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const data = await apiFetch("/blogPosts");

    expect(data).toEqual({ ok: true });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/blogPosts");
    expect(options.headers.Authorization).toBe("Bearer abc123");
  });

  it("lancia ApiError con il messaggio del server", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "wrong credentials" }), {
          status: 401,
        })
      )
    );

    const error = await apiFetch("/auth/login", { auth: false }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
    expect(error.message).toBe("wrong credentials");
  });

  it("espone gli errori di validazione (array errors)", async () => {
    const body = {
      statusCode: 400,
      message: "Validation failed",
      errors: [{ msg: "Title is required" }],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(body), { status: 400 })
      )
    );

    const error = await apiFetch("/blogPosts", {
      method: "POST",
      body: {},
    }).catch((e) => e);

    expect(error.errors).toHaveLength(1);
    expect(error.errors[0].msg).toBe("Title is required");
  });

  it("converte gli errori di rete in ApiError con status 0", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    const error = await apiFetch("/blogPosts").catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
  });

  it("non allega Authorization quando auth=false", async () => {
    setToken("abc123");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ token: "t" }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/auth/login", {
      method: "POST",
      body: { email: "a@b.com", password: "secret123" },
      auth: false,
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it("con FormData non forza il Content-Type JSON e invia il file", async () => {
    setToken("abc123");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ status: "success", post: { cover: "https://x/cover.jpg" } }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const formData = new FormData();
    formData.append("cover", new Blob(["img"], { type: "image/png" }), "cover.png");

    const data = await apiFetch("/blogPosts/123/cover", {
      method: "PATCH",
      body: formData,
    });

    expect(data.post.cover).toBe("https://x/cover.jpg");
    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers["Content-Type"]).toBeUndefined();
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.headers.Authorization).toBe("Bearer abc123");
  });
});

describe("updatePost", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("invia PUT con JSON e token Bearer", async () => {
    setToken("tok456");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ _id: "p1", title: "Nuovo" }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const payload = {
      title: "Nuovo",
      category: "Tech",
      content: "<p>x</p>",
      cover: "https://x/c.jpg",
      readTime: { value: 2, unit: "minutes" },
    };
    const data = await updatePost("p1", payload);

    expect(data.title).toBe("Nuovo");
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/blogPosts/p1");
    expect(options.method).toBe("PUT");
    expect(options.headers.Authorization).toBe("Bearer tok456");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(options.body)).toEqual(payload);
  });
});

describe("deletePost", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("invia DELETE con token Bearer", async () => {
    setToken("tok789");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ deleted: true }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    await deletePost("p9");

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/blogPosts/p9");
    expect(options.method).toBe("DELETE");
    expect(options.headers.Authorization).toBe("Bearer tok789");
  });
});
