import Login from "./views/login/Login";
import NavBar from "./components/navbar/BlogNavbar";
import Footer from "./components/footer/Footer";
import Home from "./views/home/Home";
import Blog from "./views/blog/Blog";
import NewBlogPost from "./views/new/New";
import EditPost from "./views/edit/Edit";
import Profile from "./views/profile/Profile";
import NotFound from "./views/not-found/NotFound";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


function App() {
  return (
    <Router>
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" exact element={<Home />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/new" element={<NewBlogPost />} />
          <Route path="/edit/:id" element={<EditPost />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
