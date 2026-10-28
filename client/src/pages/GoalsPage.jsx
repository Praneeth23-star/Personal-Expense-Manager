import React, { useState, useEffect } from 'react';
import { getGoalsApi, deleteGoalApi } from '../services/api';
import { Target, PlusCircle, CheckCircle, Clock, Trash2, Edit2, Plus, Award } from 'lucide-react';
import GoalModal from '../components/GoalModal';

const GoalsPage = ({ currency = '$' }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isDepositMode, setIsDepositMode] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await getGoalsApi();
      setGoals(res.data.data);
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        await deleteGoalApi(id);
        fetchGoals();
      } catch (err) {
        alert('Failed to delete goal');
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setIsDepositMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    setIsDepositMode(false);
    setIsModalOpen(true);
  };

  const handleOpenDeposit = (goal) => {
    setEditingGoal(goal);
    setIsDepositMode(true);
    setIsModalOpen(true);
  };

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const completedCount = goals.filter((g) => g.isCompleted).length;

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold tracking-tight mb-1">Savings Goals & Sinking Funds</h2>
          <p className="text-muted small mb-0">
            Allocate funds, monitor milestones, and hit your long-term wealth targets.
          </p>
        </div>

        <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={handleOpenAdd}>
          <PlusCircle size={16} />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Overview Card */}
      {goals.length > 0 && (
        <div className="card p-4 mb-4 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: '#fff' }}>
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-4">
              <span className="text-white-50 small fw-bold text-uppercase">Total Funds Allocated</span>
              <h2 className="fw-bold mb-0 text-white mt-1">
                {currency}{totalSaved.toLocaleString()}
              </h2>
              <span className="text-white-50 small">Target: {currency}{totalTarget.toLocaleString()}</span>
            </div>
            <div className="col-12 col-md-4">
              <span className="text-white-50 small fw-bold text-uppercase">Goals Completed</span>
              <h2 className="fw-bold mb-0 text-white mt-1">
                {completedCount} of {goals.length}
              </h2>
              <span className="text-white-50 small">
                {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}% total funding rate
              </span>
            </div>
            <div className="col-12 col-md-4 text-md-end">
              <div className="badge bg-white text-primary p-2 px-3 rounded-pill fw-bold">
                🎯 {goals.length - completedCount} In Progress
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {loading ? (
        <div className="card p-5 text-center">
          <div className="spinner-border text-primary mx-auto mb-2" role="status"></div>
          <p className="text-muted mb-0">Loading savings goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="card p-5 text-center shadow-sm">
          <div className="bg-light text-primary p-3 rounded-circle d-inline-block mx-auto mb-3">
            <Target size={40} />
          </div>
          <h5 className="fw-bold mb-1">No savings goals created yet</h5>
          <p className="text-muted small mb-3">
            Create your first target like an Emergency Fund, New Laptop, or Vacation!
          </p>
          <div>
            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              Create Savings Goal
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {goals.map((goal) => {
            return (
              <div key={goal._id} className="col-12 col-md-6 col-xl-4">
                <div className="card card-hover h-100 p-4 border shadow-sm">
                  {/* Card Header */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span className="badge-category small mb-2 d-inline-block">{goal.category}</span>
                      <h5 className="fw-bold text-dark mb-0">{goal.title}</h5>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <button
                        className="btn btn-outline-secondary btn-sm p-1 border-0"
                        title="Edit Goal"
                        onClick={() => handleOpenEdit(goal)}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm p-1 border-0"
                        title="Delete Goal"
                        onClick={() => handleDeleteGoal(goal._id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Progress & Values */}
                  <div className="my-3">
                    <div className="d-flex justify-content-between align-items-baseline mb-1">
                      <span className="fs-4 fw-bold text-dark">
                        {currency}{goal.currentAmount.toLocaleString()}
                      </span>
                      <span className="text-muted small">
                        of {currency}{goal.targetAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${goal.percentage}%`,
                          backgroundColor: goal.color || '#4f46e5',
                        }}
                      ></div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center small mt-2">
                      <span className="fw-bold" style={{ color: goal.color }}>
                        {goal.percentage}% Funded
                      </span>
                      <span className="text-muted">
                        {goal.remainingAmount > 0
                          ? `${currency}${goal.remainingAmount.toLocaleString()} remaining`
                          : 'Goal Reached! 🎉'}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                    <div className="small text-muted d-flex align-items-center gap-1">
                      <Clock size={14} />
                      <span>
                        {goal.daysLeft > 0 ? `${goal.daysLeft} days left` : 'Past Deadline'}
                      </span>
                    </div>

                    {goal.isCompleted ? (
                      <span className="badge bg-success bg-opacity-10 text-success border border-success d-flex align-items-center gap-1">
                        <Award size={14} />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <button
                        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                        onClick={() => handleOpenDeposit(goal)}
                      >
                        <Plus size={14} />
                        <span>Deposit</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchGoals}
        initialData={editingGoal}
        depositMode={isDepositMode}
        currency={currency}
      />
    </div>
  );
};

export default GoalsPage;
