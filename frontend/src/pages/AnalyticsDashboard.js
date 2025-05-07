// src/pages/AnalyticsDashboard.js
import React, { useState, useEffect } from 'react';
import { getTotalOrders, getTotalRevenue, getRecentOrders, getPopularProducts } from '../services/analyticsService';
import './AnalyticsDashboard.css'; //  Create a CSS file for styling

const AnalyticsDashboard = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersCount = await getTotalOrders();
        const revenue = await getTotalRevenue();
        const recent = await getRecentOrders();
        const popular = await getPopularProducts();

        setTotalOrders(ordersCount);
        setTotalRevenue(revenue);
        setRecentOrders(recent);
        setPopularProducts(popular);
      } catch (err) {
        setError('Failed to fetch analytics data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="analytics-dashboard">
      <h2>Analytics Dashboard</h2>

      <div className="analytics-metrics">
        <div className="metric-card">
          <h3>Total Orders</h3>
          <p>{totalOrders}</p>
        </div>

        <div className="metric-card">
          <h3>Total Revenue</h3>
          <p>₪{totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="analytics-tables">
        <div className="table-card">
          <h4>Recent Orders</h4>
          {recentOrders.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  {/* Add more columns as needed */}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.createdAt}</td>
                    {/* Add more data cells */}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No recent orders.</p>
          )}
        </div>

        <div className="table-card">
          <h4>Popular Products</h4>
          {popularProducts.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Rental Count</th>
                  {/* Add more columns */}
                </tr>
              </thead>
              <tbody>
                {popularProducts.map(product => (
                  <tr key={product.productId}>
                    <td>{product.productName}</td>
                    <td>{product.rentalCount}</td>
                    {/* Add more data cells */}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No popular products data.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;