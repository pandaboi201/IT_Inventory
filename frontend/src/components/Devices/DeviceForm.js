import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createDevice, updateDevice, getDevice, getDeviceCategories } from '../../services/api';

function DeviceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [device, setDevice] = useState({
    device_name: '',
    category_id: '',
    serial_number: '',
    model: '',
    manufacturer: '',
    purchase_date: '',
    purchase_price: '',
    warranty_expiry: '',
    status: 'available',
    location: '',
    specifications: '',
    notes: ''
  });

  useEffect(() => {
    loadCategories();
    if (id) loadDevice();
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await getDeviceCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadDevice = async () => {
    try {
      const response = await getDevice(id);
      setDevice(response.data.data);
    } catch (error) {
      console.error('Failed to load device:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateDevice(id, device);
      } else {
        await createDevice(device);
      }
      navigate('/devices');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save device');
    }
  };

  return (
    <div className="card">
      <h1>{id ? 'Edit Device' : 'Add New Device'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Device Name *</label>
          <input
            type="text"
            value={device.device_name}
            onChange={(e) => setDevice({ ...device, device_name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Serial Number *</label>
          <input
            type="text"
            value={device.serial_number}
            onChange={(e) => setDevice({ ...device, serial_number: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select
            value={device.category_id}
            onChange={(e) => setDevice({ ...device, category_id: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Model</label>
          <input
            type="text"
            value={device.model}
            onChange={(e) => setDevice({ ...device, model: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Manufacturer</label>
          <input
            type="text"
            value={device.manufacturer}
            onChange={(e) => setDevice({ ...device, manufacturer: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={device.location}
            onChange={(e) => setDevice({ ...device, location: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Purchase Date</label>
          <input
            type="date"
            value={device.purchase_date}
            onChange={(e) => setDevice({ ...device, purchase_date: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Purchase Price</label>
          <input
            type="number"
            step="0.01"
            value={device.purchase_price}
            onChange={(e) => setDevice({ ...device, purchase_price: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Warranty Expiry</label>
          <input
            type="date"
            value={device.warranty_expiry}
            onChange={(e) => setDevice({ ...device, warranty_expiry: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select
            value={device.status}
            onChange={(e) => setDevice({ ...device, status: e.target.value })}
          >
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="under_repair">Under Repair</option>
            <option value="retired">Retired</option>
          </select>
        </div>
        <div className="form-group">
          <label>Specifications</label>
          <textarea
            value={device.specifications}
            onChange={(e) => setDevice({ ...device, specifications: e.target.value })}
            rows="4"
          />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={device.notes}
            onChange={(e) => setDevice({ ...device, notes: e.target.value })}
            rows="3"
          />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn btn-primary">
            {id ? 'Update' : 'Create'} Device
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/devices')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default DeviceForm;
