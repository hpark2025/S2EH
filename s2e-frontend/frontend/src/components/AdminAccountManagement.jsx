import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { accountAPI } from '../services/accountAPI';

export default function AdminAccountManagement() {
  const [currentTab, setCurrentTab] = useState('customers');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    status: '',
    business_name: '',
    business_type: ''
  });

  const [createForm, setCreateForm] = useState({
    account_type: 'customer',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    business_name: '',
    business_type: '',
    status: 'active'
  });

  useEffect(() => {
    loadAccounts();
  }, [currentTab]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await accountAPI.getAccount.getAllAccounts(currentTab);
      setAccounts(response[currentTab] || []);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await accountAPI.utilities.searchAccounts(searchQuery, currentTab);
      setAccounts(response[currentTab] || []);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAccount = (account) => {
    setSelectedAccount(account);
    setEditForm({
      first_name: account.first_name || '',
      last_name: account.last_name || '',
      email: account.email || '',
      phone: account.phone || '',
      status: account.status || '',
      business_name: account.business_name || '',
      business_type: account.business_type || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await accountAPI.updateAccount.updateAccountById(
        selectedAccount.id,
        editForm,
        currentTab
      );
      toast.success('Account updated successfully!');
      setShowEditModal(false);
      loadAccounts();
    } catch (error) {
      console.error('Failed to update account:', error);
      toast.error('Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { account_type, ...accountData } = createForm;
      await accountAPI.createAccount[`create${account_type.charAt(0).toUpperCase() + account_type.slice(1)}`](accountData);
      toast.success('Account created successfully!');
      setShowCreateModal(false);
      setCreateForm({
        account_type: 'customer',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        business_name: '',
        business_type: '',
        status: 'active'
      });
      loadAccounts();
    } catch (error) {
      console.error('Failed to create account:', error);
      toast.error('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return;
    }

    try {
      setLoading(true);
      await accountAPI.deleteAccount.deleteAccountById(accountId, currentTab);
      toast.success('Account deleted successfully!');
      loadAccounts();
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (accountId, newStatus) => {
    try {
      setLoading(true);
      await accountAPI.updateAccount.updateAccountStatus(accountId, newStatus, currentTab);
      toast.success('Account status updated successfully!');
      loadAccounts();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-account-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Account Management</h4>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus me-2"></i>
          Create Account
        </button>
      </div>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${currentTab === 'customer' ? 'active' : ''}`}
            onClick={() => setCurrentTab('customer')}
          >
            Customers
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${currentTab === 'seller' ? 'active' : ''}`}
            onClick={() => setCurrentTab('seller')}
          >
            Sellers
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${currentTab === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentTab('admin')}
          >
            Admins
          </button>
        </li>
      </ul>

      {/* Search Bar */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              className="btn btn-outline-secondary"
              onClick={handleSearch}
              disabled={loading}
            >
              Search
            </button>
          </div>
        </div>
        <div className="col-md-4">
          <button 
            className="btn btn-outline-primary"
            onClick={loadAccounts}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    {currentTab === 'seller' && <th>Business</th>}
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.id}>
                      <td>
                        {account.first_name} {account.last_name}
                      </td>
                      <td>{account.email}</td>
                      <td>{account.phone || '-'}</td>
                      {currentTab === 'seller' && (
                        <td>
                          {account.business_name || '-'}
                          <br />
                          <small className="text-muted">{account.business_type || '-'}</small>
                        </td>
                      )}
                      <td>
                        <span className={`badge ${
                          account.status === 'active' ? 'bg-success' :
                          account.status === 'pending' ? 'bg-warning' :
                          account.status === 'inactive' ? 'bg-danger' :
                          'bg-secondary'
                        }`}>
                          {account.status || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        {account.created_at ? new Date(account.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditAccount(account)}
                          >
                            Edit
                          </button>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-secondary dropdown-toggle"
                              data-bs-toggle="dropdown"
                            >
                              Status
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleStatusChange(account.id, 'active')}
                                >
                                  Active
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleStatusChange(account.id, 'pending')}
                                >
                                  Pending
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleStatusChange(account.id, 'inactive')}
                                >
                                  Inactive
                                </button>
                              </li>
                            </ul>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteAccount(account.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Account</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUpdateAccount}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.first_name}
                        onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.last_name}
                        onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  {currentTab === 'seller' && (
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Business Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editForm.business_name}
                          onChange={(e) => setEditForm({...editForm, business_name: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Business Type</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editForm.business_type}
                          onChange={(e) => setEditForm({...editForm, business_type: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Account</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateAccount}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Account Type</label>
                    <select
                      className="form-control"
                      value={createForm.account_type}
                      onChange={(e) => setCreateForm({...createForm, account_type: e.target.value})}
                    >
                      <option value="customer">Customer</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={createForm.first_name}
                        onChange={(e) => setCreateForm({...createForm, first_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={createForm.last_name}
                        onChange={(e) => setCreateForm({...createForm, last_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={createForm.email}
                        onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={createForm.phone}
                        onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  {(createForm.account_type === 'seller' || createForm.account_type === 'admin') && (
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Business Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={createForm.business_name}
                          onChange={(e) => setCreateForm({...createForm, business_name: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Business Type</label>
                        <input
                          type="text"
                          className="form-control"
                          value={createForm.business_type}
                          onChange={(e) => setCreateForm({...createForm, business_type: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={createForm.status}
                      onChange={(e) => setCreateForm({...createForm, status: e.target.value})}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

