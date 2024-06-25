import React from 'react';
import { FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <>
    <div className='flex py-5'><Link to='/'><FaHome className='h-6 w-6 m-5'/></Link><h1 className='text-4xl font-bold mx-auto my-auto'>Sportsync</h1></div><hr/>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">About us</h1>
        <div className="text-lg max-w-2xl mx-auto">
          <p className="mb-4">
            SportSync is dedicated to providing high-quality sports equipment to athletes of all levels.
            Our mission is to inspire and empower individuals to achieve their athletic goals
            by offering top-notch gear at affordable prices.
          </p>
          <p className="mb-4">
            At SportSync, we believe in the power of sports to bring people together,
            foster teamwork, and promote a healthy lifestyle. Whether you're a professional athlete
            or just starting your fitness journey, we have everything you need to succeed.
          </p>
          <p className="mb-4">
            Our curated selection of sports equipment includes gear for a wide range of activities,
            from soccer and basketball to yoga and hiking. We carefully source our products from
            trusted manufacturers to ensure durability, performance, and style.
          </p>
          <p>
            Thank you for choosing SportSync as your partner in achieving your athletic dreams.
            We look forward to serving you and being a part of your sporting adventures.
          </p>
        </div>
      </div>
    </>
  );
};

export default About;
