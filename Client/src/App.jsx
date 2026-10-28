
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5001/api";

function App() {
  const [page, setPage] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("Connecting to AgriTech...");
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "Seeds",
    description: "",
    price: "",
    stock: ""
  });

  const [farmForm, setFarmForm] = useState({
    farmName: "",
    location: "",
    area: "",
    areaUnit: "acre",
    soilType: ""
  });

  async function request(endpoint, options = {}, authToken = token) {
    const headers = {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers
    };

    const response = await fetch(`${API}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
  }

  async function loadData(currentToken = token) {
    try {
      const [health, productData] = await Promise.all([
        request("/", {}, ""),
        request("/products", {}, "")
      ]);

      setProducts(Array.isArray(productData) ? productData : []);

      if (currentToken) {
        const results = await Promise.allSettled([
          request("/farms", {}, currentToken),
          request("/crops", {}, currentToken),
          request("/bookings", {}, currentToken)
        ]);

        setFarms(
          results[0].status === "fulfilled" && Array.isArray(results[0].value)
            ? results[0].value
            : []
        );

        setCrops(
          results[1].status === "fulfilled" && Array.isArray(results[1].value)
            ? results[1].value
            : []
        );

        setBookings(
          results[2].status === "fulfilled" && Array.isArray(results[2].value)
            ? results[2].value
            : []
        );
      } else {
        setFarms([]);
        setCrops([]);
        setBookings([]);
      }

      setMessage(health.message || "Connected to AgriTech API");
    } catch (error) {
      setMessage(`Connection error: ${error.message}`);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  async function login(event) {
    event.preventDefault();

    try {
      setMessage("Logging in...");

      const data = await request(
        "/users/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        },
        ""
      );

      const receivedToken = data.token || data.accessToken;

      if (!receivedToken) {
        throw new Error("Login succeeded without a token in the response");
      }

      localStorage.setItem("token", receivedToken);
      setToken(receivedToken);
      setPassword("");
      setMessage("Login successful");
      setPage("dashboard");
    } catch (error) {
      setMessage(`Login failed: ${error.message}`);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setPassword("");
    setMessage("Logged out");
    setPage("login");
  }

  async function addFarm(event) {
    event.preventDefault();

    if (!token) {
      setMessage("Please log in before adding a farm");
      setPage("login");
      return;
    }

    try {
      await request("/farms", {
        method: "POST",
        body: JSON.stringify({
          farmName: farmForm.farmName.trim(),
          location: farmForm.location.trim(),
          area: Number(farmForm.area),
          areaUnit: farmForm.areaUnit,
          soilType: farmForm.soilType.trim()
        })
      });

      setFarmForm({
        farmName: "",
        location: "",
        area: "",
        areaUnit: "acre",
        soilType: ""
      });

      setMessage("Farm added successfully");
      await loadData();
      setPage("farms");
    } catch (error) {
      setMessage(`Could not add farm: ${error.message}`);
    }
  }

  async function addProduct(event) {
    event.preventDefault();

    try {
      await request("/products", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          description: form.description,
          price: Number(form.price),
          stock: Number(form.stock)
        })
      });

      setForm({
        name: "",
        category: "Seeds",
        description: "",
        price: "",
        stock: ""
      });

      setMessage("Product added successfully");
      await loadData();
      setPage("products");
    } catch (error) {
      setMessage(`Could not add product: ${error.message}`);
    }
  }

  async function bookProduct(product) {
    if (!token) {
      setMessage("Log in before booking a product");
      setPage("login");
      return;
    }

    try {
      await request("/bookings", {
        method: "POST",
        body: JSON.stringify({
          product: product._id,
          quantity: 1
        })
      });

      setMessage(`Booking created for ${product.name}`);
      await loadData();
      setPage("bookings");
    } catch (error) {
      setMessage(`Booking failed: ${error.message}`);
    }
  }

  async function cancelBooking(bookingId) {
    try {
      await request(`/bookings/${bookingId}/cancel`, {
        method: "PATCH"
      });

      setMessage("Booking cancelled");
      await loadData();
    } catch (error) {
      setMessage(`Cancellation failed: ${error.message}`);
    }
  }

  const stats = [
    { label: "My Farms", value: farms.length },
    { label: "My Crops", value: crops.length },
    { label: "Products", value: products.length },
    { label: "My Bookings", value: bookings.length }
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>AgriTech</h2>
        <p className="tagline">Smart Farming Platform</p>

        <button type="button" onClick={() => setPage("dashboard")}>
          Dashboard
        </button>
        <button type="button" onClick={() => setPage("products")}>
          Marketplace
        </button>
        <button type="button" onClick={() => setPage("add-product")}>
          Add Product
        </button>
        <button type="button" onClick={() => setPage("farms")}>
          My Farms
        </button>
        <button type="button" onClick={() => setPage("crops")}>
          My Crops
        </button>
        <button type="button" onClick={() => setPage("bookings")}>
          My Bookings
        </button>
        <button type="button" onClick={() => setPage("login")}>
          {token ? "Account" : "Login"}
        </button>

        {token && (
          <button type="button" onClick={logout}>
            Logout
          </button>
        )}
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>
              {page === "dashboard"
                ? "Dashboard"
                : page === "products"
                ? "Agricultural Marketplace"
                : page === "add-product"
                ? "Add Product"
                : page === "farms"
                ? "My Farms"
                : page === "crops"
                ? "My Crops"
                : page === "bookings"
                ? "My Bookings"
                : "Account"}
            </h1>
            <p>Manage your agricultural activities in one place.</p>
          </div>

          <span className="status" role="status">
            {message}
          </span>
        </header>

        {page === "dashboard" && (
          <>
            <section className="hero">
              <div>
                <p className="eyebrow">AGRICULTURE MANAGEMENT</p>
                <h2>Grow smarter with AgriTech.</h2>
                <p>
                  Manage farms, monitor crops, explore products and track
                  your bookings.
                </p>
                <button
                  type="button"
                  onClick={() => setPage("products")}
                >
                  Explore Marketplace
                </button>
              </div>
            </section>

            <section className="stats">
              {stats.map((stat) => (
                <article className="stat-card" key={stat.label}>
                  <p>{stat.label}</p>
                  <h2>{stat.value}</h2>
                </article>
              ))}
            </section>

            <section className="section">
              <h2>Featured Products</h2>
              <ProductGrid
                products={products.slice(0, 3)}
                onBook={bookProduct}
              />
            </section>

            <section className="section weather">
              <h2>Farming Information</h2>
              <p>
                Check local weather forecasts before irrigation, spraying
                or fertilizer application. Live weather data is not
                connected in this demo.
              </p>
            </section>
          </>
        )}

        {page === "products" && (
          <section className="section">
            <h2>Available Products</h2>
            <ProductGrid products={products} onBook={bookProduct} />
          </section>
        )}

        {page === "add-product" && (
          <section className="section form-card">
            <h2>Add an Agricultural Product</h2>

            {!token ? (
              <p>Please log in before adding a product.</p>
            ) : (
              <form onSubmit={addProduct}>
                <label htmlFor="product-name">Product Name</label>
                <input
                  id="product-name"
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Wheat Seeds"
                />

                <label htmlFor="product-category">Category</label>
                <select
                  id="product-category"
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                >
                  <option>Seeds</option>
                  <option>Fertilizers</option>
                  <option>Pesticides</option>
                  <option>Equipment</option>
                  <option>Other</option>
                </select>

                <label htmlFor="product-description">Description</label>
                <textarea
                  id="product-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Product details"
                />

                <label htmlFor="product-price">Price (₹)</label>
                <input
                  id="product-price"
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: event.target.value })
                  }
                />

                <label htmlFor="product-stock">Stock Quantity</label>
                <input
                  id="product-stock"
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(event) =>
                    setForm({ ...form, stock: event.target.value })
                  }
                />

                <button type="submit">Add Product</button>
              </form>
            )}
          </section>
        )}

        {page === "farms" && (
          <>
            <section className="section form-card">
              <h2>Add a Farm</h2>
              {!token ? (
                <p>Please log in to add and manage your farms.</p>
              ) : (
                <form onSubmit={addFarm}>
                  <label htmlFor="farm-name">Farm Name</label>
                  <input
                    id="farm-name"
                    required
                    value={farmForm.farmName}
                    onChange={(event) =>
                      setFarmForm({ ...farmForm, farmName: event.target.value })
                    }
                    placeholder="e.g. Green Valley Farm"
                  />

                  <label htmlFor="farm-location">Location</label>
                  <input
                    id="farm-location"
                    required
                    value={farmForm.location}
                    onChange={(event) =>
                      setFarmForm({ ...farmForm, location: event.target.value })
                    }
                    placeholder="Village, district or city"
                  />

                  <label htmlFor="farm-area">Farm Area</label>
                  <input
                    id="farm-area"
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={farmForm.area}
                    onChange={(event) =>
                      setFarmForm({ ...farmForm, area: event.target.value })
                    }
                    placeholder="e.g. 2.5"
                  />

                  <label htmlFor="farm-area-unit">Area Unit</label>
                  <select
                    id="farm-area-unit"
                    value={farmForm.areaUnit}
                    onChange={(event) =>
                      setFarmForm({ ...farmForm, areaUnit: event.target.value })
                    }
                  >
                    <option value="acre">Acre</option>
                    <option value="hectare">Hectare</option>
                  </select>

                  <label htmlFor="farm-soil-type">Soil Type</label>
                  <input
                    id="farm-soil-type"
                    value={farmForm.soilType}
                    onChange={(event) =>
                      setFarmForm({ ...farmForm, soilType: event.target.value })
                    }
                    placeholder="e.g. Black soil"
                  />

                  <button type="submit">Add Farm</button>
                </form>
              )}
            </section>

            <section className="section">
              <h2>Your Farms</h2>
              {!token ? (
                <p>Log in to view your farms.</p>
              ) : farms.length ? (
                farms.map((farm) => (
                  <article className="list-card" key={farm._id}>
                    <h3>{farm.farmName}</h3>
                    <p>Location: {farm.location}</p>
                    <p>Area: {farm.area} {farm.areaUnit}</p>
                    <p>Soil: {farm.soilType || "Not specified"}</p>
                  </article>
                ))
              ) : (
                <p>No farms found yet. Use the form above to add your first farm.</p>
              )}
            </section>
          </>
        )}

        {page === "crops" && (
          <section className="section">
            <h2>Your Crops</h2>
            {!token ? (
              <p>Log in to view your crops.</p>
            ) : crops.length ? (
              crops.map((crop) => (
                <article className="list-card" key={crop._id}>
                  <h3>{crop.name}</h3>
                  <p>Category: {crop.category}</p>
                  <p>Season: {crop.season}</p>
                  <p>{crop.description}</p>
                </article>
              ))
            ) : (
              <p>No crops found.</p>
            )}
          </section>
        )}

        {page === "bookings" && (
          <section className="section">
            <h2>Your Bookings</h2>
            {!token ? (
              <p>Log in to view your bookings.</p>
            ) : bookings.length ? (
              bookings.map((booking) => (
                <article className="list-card" key={booking._id}>
                  <h3>{booking.product?.name || "Product"}</h3>
                  <p>Quantity: {booking.quantity}</p>
                  <p>Total: ₹{booking.totalPrice}</p>
                  <p>Status: {booking.status}</p>

                  {booking.status === "Pending" && (
                    <button
                      type="button"
                      onClick={() => cancelBooking(booking._id)}
                    >
                      Cancel Booking
                    </button>
                  )}
                </article>
              ))
            ) : (
              <p>No bookings found.</p>
            )}
          </section>
        )}

        {page === "login" && (
          <section className="section form-card">
            <h2>{token ? "You are logged in" : "Farmer Login"}</h2>

            {!token ? (
              <form onSubmit={login} autoComplete="on">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  required
                />

                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                />

                <button type="submit">Login</button>
              </form>
            ) : (
              <button type="button" onClick={logout}>
                Logout
              </button>
            )}
          </section>
        )}

        <footer>AgriTech Project · Smart Farming Management</footer>
      </main>
    </div>
  );
}

function ProductGrid({ products, onBook }) {
  if (!products.length) {
    return <p>No products available yet. Add a product to get started.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <article className="product-card" key={product._id}>
          <div className="product-icon">
            {product.category === "Seeds"
              ? "🌱"
              : product.category === "Fertilizers"
              ? "🌾"
              : product.category === "Equipment"
              ? "🚜"
              : "🌿"}
          </div>

          <span className="category">{product.category}</span>
          <h3>{product.name}</h3>
          <p>{product.description || "Agricultural product"}</p>
          <h2>₹{product.price}</h2>
          <p>Stock: {product.stock}</p>

          <button
            type="button"
            disabled={product.stock < 1}
            onClick={() => onBook(product)}
          >
            {product.stock < 1 ? "Out of Stock" : "Book Product"}
          </button>
        </article>
      ))}
    </div>
  );
}

export default App;
