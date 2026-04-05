import SearchBar from "../../components/searchBar/SearchBar";
import "./homePage.scss";

function HomePage() {
  return (
    <div className="homePage">
      <div className="textContainer">
        <div className="wrapper">
          <h1 className="title">Find Safe, Smart Boarding Near Your Campus</h1>
          <p>
            Discover student-friendly boarding places, compare amenities,
            shortlist the right stay, and connect with owners without losing
            the familiar experience of the current app.
          </p>
          <SearchBar />
          <div className="boxes">
            <div className="box">
              <h1>500+</h1>
              <h2>Boardings Listed</h2>
            </div>
            <div className="box">
              <h1>24/7</h1>
              <h2>Smart Alerts</h2>
            </div>
            <div className="box">
              <h1>1000+</h1>
              <h2>Students Helped</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default HomePage;
