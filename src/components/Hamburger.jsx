import React, { useState } from "react";
import "../index.css";
function Hamburger({isOpen}) {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <>
        <div className="hamburger-menu" onClick={() => setIsOpen(!isOpen)}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
        {isOpen && (
          <div className="menu bg-blue-900">
            <ul>
              <li>Camping Tent</li>
              <li>Camping Chairs And Bed</li>
              <li>Sleeping Bags</li>
              <li>Waterproof Trekking Boots</li>
              <li>Ski Equipment</li>
              <li>Rock Climbing Equipment</li>
              <li>Binoculars And Flashlights</li>
              <li>Gym Weights & Dumbbells</li>
              <li>Electric Bike</li>
              <li>Home Gym</li>
              <li>Resistance Training Bands</li>
              <li>Gym Gloves & Supports</li>
              <li>Gym Mat & Accessories</li>
              <li>Racket Sports And Accessories</li>
              <li>Team Sports Essentials</li>
              <li>Footballs</li>
              <li>Leisure Sport Equipment</li>
              <li>Darts</li>
              <li>Elliptical & Cross Trainer</li>
              <li>Treadmills</li>
              <li>Badminton Rackets</li>
              <li>Badminton Shuttles</li>
              <li>Football Training Accessories</li>
              <li>Skating</li>
              <li>Basketball</li>
              <li>Cycling</li>
              <li>Badminton Net</li>
              <li>Basketball Hoops</li>
              <li>Fishing</li>
              <li>Badminton Racket Strings</li>
              <li>Badminton Racket Grips</li>
              <li>Tennis Rackets</li>
              <li>Tennis Balls</li>
              <li>Tennis Racket Grips</li>
              <li>Standing Basketball Backboard</li>
              <li>Tennis Cricket Bats And Balls</li>
              <li>Billiards</li>
              <li>Carrom</li>
              <li>Leather Cricket Bats And Balls</li>
              <li>Cricket Protection And Kits</li>
              <li>Volleyball</li>
              <li>Archery</li>
              <li>TT Bats, Balls And Tables</li>
            </ul>
          </div>
        )}
        </>
    );
  }

  export default Hamburger