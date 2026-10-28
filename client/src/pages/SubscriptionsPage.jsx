import React, { useState, useEffect } from 'react';
import { getSubscriptionsApi, paySubscriptionApi, deleteSubscriptionApi } from '../services/api';
import { RefreshCw, PlusCircle, CheckCircle, Clock, Trash2, Edit2, AlertCircle, CreditCard } from 'lucide-react';
import SubscriptionModal from '../components/SubscriptionModal';

const SubscriptionsPage = ({ currency = '$' }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [monthlyBurn, setMonthlyBurn] = useState(0);
  const [annualBurn, setAnnualBurn] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await getSubscriptionsApi();
      setSubscriptions(res.data.data);
      setMonthlyBurn(res.data.monthlyBurn);
      setAnnualBurn(res.data.annualBurn);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handlePay = async (id, name) => {
    if (window.confirm(`Record payment for "${name}" and advance next billing date?`)) {
      try {
        await paySubscriptionApi(id);
        fetchSubscriptions();
      } catch (err) {
        alert('Failed to process payment');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await deleteSubscriptionApi(id);
        fetchSubscriptions();
      } catch (err) {
        alert('Failed to delete subscription');
      }
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold tracking-tight mb-1">Recurring Bills & Subscriptions</h2>
          <p className="text-muted small mb-0">
            Audit monthly recurring costs, prevent surprise renewals, and pay with one click.
          </p>
        </div>

        <button
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
          onClick={() => {
            setEditingSub(null);
            setIsModalOpen(true);
          }}
        >
          <PlusCircle size={16} />
          <span>Add Recurring Bill</span>
        </button>
      </div>

      {/* Burn Rate Aggregation Banner */}
      <div className="card p-4 mb-4 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)', color: '#fff' }}>
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4">
            <span className="text-white-50 small fw-bold text-uppercase">Monthly Recurring Outflow</span>
            <h2 className="fw-bold mb-0 text-white mt-1">
              {currency}{monthlyBurn.toLocaleString()}
              <span className="fs-6 text-white-50 fw-normal"> / month</span>
            </h2>
          </div>
          <div className="col-12 col-md-4">
            <span className="text-white-50 small fw-bold text-uppercase">Projected Annual Commitment</span>
            <h2 className="fw-bold mb-0 text-white mt-1">
              {currency}{annualBurn.toLocaleString()}
              <span className="fs-6 text-white-50 fw-normal"> / year</span>
            </h2>
          </div>
          <div className="col-12 col-md-4 text-md-end">
            <div className="badge bg-white text-info p-2 px-3 rounded-pill fw-bold">
              🔄 {subscriptions.length} Active Subscriptions
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      {loading ? (
        <div className="card p-5 text-center">
          <div className="spinner-border text-primary mx-auto mb-2" role="status"></div>
          <p className="text-muted mb-0">Loading subscriptions...</p>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="card p-5 text-center shadow-sm">
          <div className="bg-light text-primary p-3 rounded-circle d-inline-block mx-auto mb-3">
            <RefreshCw size={40} />
          </div>
          <h5 className="fw-bold mb-1">No recurring bills tracked yet</h5>
          <p className="text-muted small mb-3">
            Keep track of Netflix, Gym, Utilities, and Software memberships here.
          </p>
          <div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingSub(null);
                setIsModalOpen(true);
              }}
            >
              Add Your First Bill
            </button>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="ps-4">Service & Plan</th>
                  <th scope="col">Category</th>
                  <th scope="col">Cycle</th>
                  <th scope="col">Next Due Date</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-end">Amount</th>
                  <th scope="col" className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const formattedDate = new Date(sub.nextBillingDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={sub._id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle p-2 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                            <CreditCard size={18} />
                          </div>
                          <div>
                            <div className="fw-semibold text-dark">{sub.name}</div>
                            {sub.notes && <div className="text-muted small">{sub.notes}</div>}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="badge-category small">{sub.category}</span>
                      </td>

                      <td className="text-capitalize small text-muted">
                        {sub.billingCycle}
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-1 small text-dark">
                          <Clock size={14} className="text-muted" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      <td>
                        {sub.status === 'urgent' ? (
                          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger small">
                            Due in {sub.daysUntilDue} days
                          </span>
                        ) : sub.status === 'upcoming' ? (
                          <span className="badge bg-warning bg-opacity-10 text-warning border border-warning small">
                            Due in {sub.daysUntilDue} days
                          </span>
                        ) : (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success small">
                            In {sub.daysUntilDue} days
                          </span>
                        )}
                      </td>

                      <td className="text-end fw-bold text-dark fs-6">
                        {currency}
                        {Number(sub.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="text-end pe-4">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <button
                            className="btn btn-outline-success btn-sm py-1 px-2 d-flex align-items-center gap-1"
                            title="Mark as Paid"
                            onClick={() => handlePay(sub._id, sub.name)}
                          >
                            <CheckCircle size={14} />
                            <span className="d-none d-md-inline" style={{ fontSize: '0.75rem' }}>Pay</span>
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm p-1 border-0"
                            title="Edit"
                            onClick={() => {
                              setEditingSub(sub);
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm p-1 border-0"
                            title="Delete"
                            onClick={() => handleDelete(sub._id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSubscriptions}
        initialData={editingSub}
        currency={currency}
      />
    </div>
  );
};

export default SubscriptionsPage;
