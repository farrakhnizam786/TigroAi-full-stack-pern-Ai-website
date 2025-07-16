import React from "react";
import Navbar from "../components/Navbar";
import Hero from '../components/Hero';
import Aitools from "../components/Aitools";
// In Home.jsx
import Testimonial from '../components/Testimonial'; // Adjust path as needed
import Pricing from "../components/Pricing";
import Footer from "../components/Footer";

const Home = () => {
    return (
    <>
      {/* fragment shorthand syntax */}
    <Navbar/>
    <Hero />
    <Aitools />
    <Testimonial />
    <Pricing />
    <Footer />
    </>
    );
}
export default Home;