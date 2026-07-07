import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getParts } from '../../services/api';

function PartsList() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadParts();
  }, [searchParams]);

  const loadParts = async () => {
    try {
      const lowStock = searchParams.get('low_stock');
      const response = await getParts({ low_stock: lowStock });
      setParts(response.data.data);
    } catch (error) {
      console.error('Failed to load parts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading parts...</div>;

  return (
    <div>
      <h1>Parts Inventory</h1>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Part Name</th>
              <th>Part Number</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Min Quantity</th>
              <th>Unit Price</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part) => (
              <tr key={part.id} style={{
                backgroundColor: part.quantity <= part.min_quantity ? '#fef2f2' : 'white'
              }}>
                <td>{part.part_name}</td>
                <td>{part.part_number}</td>
                <td>{part.category || '-'}</td>
                <td>
                  <strong>{part.quantity}</strong>
                  {part.quantity <= part.min_quantity && (
                    <span style={{ color: '#dc2626', marginLeft: '8px' }}>⚠️ Low</span>
                  )}
                </td>
                <td>{part.min_quantity}</td>
                <td>${part.unit_price || '0.00'}</td>
                <td>{part.location || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PartsList;
